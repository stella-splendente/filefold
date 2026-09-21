import { describe, it, expect } from "vitest";
import { unzipSync } from "fflate";
import { zipResults } from "./zip";

describe("zipResults", () => {
  it("이름과 내용을 보존한 zip Blob 을 만든다", async () => {
    const result = zipResults([{ name: "a.txt", data: new TextEncoder().encode("hi") }], "out.zip");

    expect(result.filename).toBe("out.zip");
    expect(result.blob.type).toBe("application/zip");
    const entries = unzipSync(new Uint8Array(await result.blob.arrayBuffer()));
    expect(new TextDecoder().decode(entries["a.txt"])).toBe("hi");
  });
});
