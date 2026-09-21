"""임시 단색 PNG 아이콘 생성 (의존성 없음). Task 12 에서 정식 아이콘으로 교체."""
import struct, zlib, sys, os

COLORS = {"pdf": (214, 69, 69), "image": (52, 140, 235), "audio": (120, 80, 200)}

def png(size, rgb):
    raw = b"".join(b"\x00" + bytes(rgb) * size for _ in range(size))
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")

suite, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
for s in (16, 32, 48, 128):
    open(os.path.join(outdir, f"{s}.png"), "wb").write(png(s, COLORS[suite]))
print("icons written to", outdir)
