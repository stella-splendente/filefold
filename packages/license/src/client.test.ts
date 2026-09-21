import { describe, it, expect, vi } from "vitest";
import { LicenseClient, type KVStore } from "./client";

const DAY = 86_400_000;
const ORG = "org_test";

function memoryStore(): KVStore {
  const m = new Map<string, string>();
  return {
    get: async (k) => m.get(k) ?? null,
    set: async (k, v) => void m.set(k, v),
    remove: async (k) => void m.delete(k),
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const activated = (benefit = "ben_pdf") => ({
  id: "act_1",
  license_key: { id: "lk_1", key: "KEY-1", benefit_id: benefit, status: "granted" },
});

function make(opts: { fetch?: typeof fetch; now?: () => number; store?: KVStore } = {}) {
  const store = opts.store ?? memoryStore();
  const client = new LicenseClient({
    organizationId: ORG,
    benefits: { ben_pdf: ["pdf"], ben_bundle: ["pdf", "image", "audio"] },
    store,
    fetch: opts.fetch ?? (vi.fn() as unknown as typeof fetch),
    now: opts.now ?? (() => 0),
  });
  return { client, store };
}

describe("LicenseClient.activate", () => {
  it("활성화에 성공하면 pro 상태를 저장한다", async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe("https://api.polar.sh/v1/customer-portal/license-keys/activate");
      expect(JSON.parse(init.body as string)).toMatchObject({ key: "KEY-1", organization_id: ORG, label: "chrome" });
      return jsonResponse(200, activated());
    }) as unknown as typeof fetch;
    const { client } = make({ fetch: fetchMock });

    const state = await client.activate("KEY-1", "chrome");

    expect(state).toMatchObject({ tier: "pro", suites: ["pdf"], key: "KEY-1", activationId: "act_1", lastValidatedAt: 0 });
    expect(await client.getState()).toMatchObject({ tier: "pro" });
  });

  it("묶음 benefit 이면 세 스위트 모두 pro", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, activated("ben_bundle"))) as unknown as typeof fetch;
    const { client } = make({ fetch: fetchMock });

    const state = await client.activate("KEY-2", "chrome");

    expect(state.suites).toEqual(["pdf", "image", "audio"]);
  });

  it("키가 틀리면 INVALID_KEY 로 거부하고 free 로 남는다", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(404, { detail: "not found" })) as unknown as typeof fetch;
    const { client } = make({ fetch: fetchMock });

    await expect(client.activate("BAD", "chrome")).rejects.toMatchObject({ code: "INVALID_KEY" });
    expect(await client.getState()).toMatchObject({ tier: "free", suites: [] });
  });

  it("기기 초과(403)는 LIMIT_REACHED", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(403, { detail: "limit" })) as unknown as typeof fetch;
    const { client } = make({ fetch: fetchMock });

    await expect(client.activate("KEY-1", "chrome")).rejects.toMatchObject({ code: "LIMIT_REACHED" });
  });

  it("네트워크 실패는 NETWORK", async () => {
    const fetchMock = vi.fn(async () => { throw new TypeError("offline"); }) as unknown as typeof fetch;
    const { client } = make({ fetch: fetchMock });

    await expect(client.activate("KEY-1", "chrome")).rejects.toMatchObject({ code: "NETWORK" });
  });
});

describe("LicenseClient.getState 재검증", () => {
  async function proClient(now: { t: number }, fetchImpl: (url: string) => Promise<Response>) {
    const calls: string[] = [];
    const fetchMock = vi.fn(async (url: string) => { calls.push(url); return fetchImpl(url); }) as unknown as typeof fetch;
    const { client } = make({ fetch: fetchMock, now: () => now.t });
    await client.activate("KEY-1", "chrome");
    return { client, calls };
  }

  it("7일 이내면 네트워크를 호출하지 않는다", async () => {
    const now = { t: 0 };
    const { client, calls } = await proClient(now, async () => jsonResponse(200, activated()));
    now.t = 6 * DAY;

    await client.getState();

    expect(calls.filter((u) => u.endsWith("/validate"))).toHaveLength(0);
  });

  it("7일이 지나면 validate 를 호출해 lastValidatedAt 을 갱신한다", async () => {
    const now = { t: 0 };
    const { client, calls } = await proClient(now, async (url) =>
      url.endsWith("/validate") ? jsonResponse(200, { id: "lk_1", key: "KEY-1", benefit_id: "ben_pdf", status: "granted", activation: { id: "act_1" } }) : jsonResponse(200, activated()),
    );
    now.t = 8 * DAY;

    const state = await client.getState();

    expect(calls.filter((u) => u.endsWith("/validate"))).toHaveLength(1);
    expect(state).toMatchObject({ tier: "pro", lastValidatedAt: 8 * DAY });
  });

  it("validate 네트워크 실패면 pro 를 유지하고 유예 종료 시각을 둔다", async () => {
    const now = { t: 0 };
    const { client } = await proClient(now, async (url) => {
      if (url.endsWith("/validate")) throw new TypeError("offline");
      return jsonResponse(200, activated());
    });
    now.t = 8 * DAY;

    const state = await client.getState();

    expect(state.tier).toBe("pro");
    expect(state.graceUntil).toBe(30 * DAY);
  });

  it("유예가 끝났는데도 실패하면 free 로 내려간다", async () => {
    const now = { t: 0 };
    const { client } = await proClient(now, async (url) => {
      if (url.endsWith("/validate")) throw new TypeError("offline");
      return jsonResponse(200, activated());
    });
    now.t = 31 * DAY;

    const state = await client.getState();

    expect(state.tier).toBe("free");
  });

  it("validate 가 403 이면 즉시 free", async () => {
    const now = { t: 0 };
    const { client } = await proClient(now, async (url) =>
      url.endsWith("/validate") ? jsonResponse(403, { detail: "revoked" }) : jsonResponse(200, activated()),
    );
    now.t = 8 * DAY;

    expect((await client.getState()).tier).toBe("free");
  });

  it("deactivate 하면 free 로 돌아간다", async () => {
    const now = { t: 0 };
    const { client } = await proClient(now, async () => jsonResponse(200, activated()));

    await client.deactivate();

    expect((await client.getState()).tier).toBe("free");
  });
});
