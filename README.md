# Filefold (작업명 filekit)

브라우저 안에서만 동작하는 파일 도구. PDF·이미지·오디오 확장 프로그램 3종(Chrome/Edge/Firefox)과 같은 엔진을 쓰는 정적 도구 사이트. 파일은 기기를 떠나지 않고, 서버가 없다.

- 설계: `docs/superpowers/specs/2026-09-21-filekit-design.md`
- 구현 계획·진행: `docs/superpowers/plans/2026-09-21-filekit-v1.md`, `docs/PROGRESS.md`
- 한 번만 하는 셋업(스토어·결제·호스팅): `docs/SETUP.md`
- 시장 조사 근거: `docs/research/`

## 구조

```
packages/core      처리 엔진 (pdf-lib, pdf.js, jSquash wasm, ffmpeg.wasm) — Web Worker 에서 실행
packages/license   Polar 라이선스 키 검증, 무료 한도
packages/ui        도구 정의(TOOLS), i18n(en/ko), Preact 컴포넌트
apps/ext-pdf|image|audio   WXT MV3 확장 (chrome/edge/firefox)
apps/web           Astro 정적 사이트 (Cloudflare Pages)
tooling/listing    아이콘·스크린샷·스토어 문구 생성
tests/e2e          Playwright (확장 로드, 웹, 시각 회귀, 접근성)
```

## 개발

```bash
pnpm install
pnpm test                                  # 단위 (node)
pnpm --filter @filekit/core test:browser   # wasm/캔버스 테스트 (Chromium)
pnpm typecheck
pnpm build                                 # 확장 3종 + 웹
pnpm e2e                                   # 확장·웹 e2e (사전 build 필요)
pnpm --filter ext-pdf build:all            # chrome/edge/firefox zip
pnpm --filter @filekit/tooling icons | screenshots | listing
```

## 배포

- `main` 푸시 → 사이트 자동 배포 (`deploy-web.yml`)
- `git tag ext-pdf@1.0.0 && git push --tags` → 세 스토어에 업데이트 게시 (`release-ext.yml`, 첫 등록은 `docs/SETUP.md`)
- 매주 월요일 의존성 감사·전체 테스트 (`weekly.yml`), 실패 시 이슈 자동 생성
