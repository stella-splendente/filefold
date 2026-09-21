import { LicenseError } from "./types";

export const POLAR_API = "https://api.polar.sh/v1/customer-portal/license-keys";

export interface PolarActivation {
  id: string;
  license_key: { id: string; key: string; benefit_id: string; status: string };
}

export interface PolarValidation {
  id: string;
  key: string;
  benefit_id: string;
  status: string;
  activation?: { id: string } | null;
}

async function post<T>(fetchImpl: typeof fetch, path: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetchImpl(`${POLAR_API}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new LicenseError("NETWORK", `Polar 에 연결할 수 없습니다: ${(err as Error).message}`);
  }
  if (res.status === 403) throw new LicenseError("LIMIT_REACHED", "활성화 가능한 기기 수를 넘었거나 키가 회수되었습니다");
  if (res.status === 404 || res.status === 422) throw new LicenseError("INVALID_KEY", "라이선스 키가 올바르지 않습니다");
  if (!res.ok) throw new LicenseError("NETWORK", `Polar 응답 오류 ${res.status}`);
  return (await res.json()) as T;
}

export function activateKey(fetchImpl: typeof fetch, organizationId: string, key: string, label: string): Promise<PolarActivation> {
  return post<PolarActivation>(fetchImpl, "activate", { key, organization_id: organizationId, label });
}

export function validateKey(fetchImpl: typeof fetch, organizationId: string, key: string, activationId?: string): Promise<PolarValidation> {
  return post<PolarValidation>(fetchImpl, "validate", { key, organization_id: organizationId, activation_id: activationId });
}
