# 진행 상황

계획: `docs/superpowers/plans/2026-09-21-filekit-v1.md` (모든 작업 체크 완료)

| Task | 내용 | 상태 |
|---|---|---|
| 0 | 브랜드명 확정 (Filefold) | 완료 |
| 1 | 모노레포 스캐폴드 | 완료 |
| 2 | core PDF 병합/분할 | 완료 |
| 3 | core PDF 회전/순서/삭제/이미지/압축 | 완료 |
| 4 | license 패키지 | 완료 |
| 5 | ui 패키지 | 완료 |
| 6 | core Worker RPC | 완료 |
| 7 | ext-pdf | 완료 |
| 8 | web (40 페이지, en/ko) | 완료 |
| 9 | 배포 파이프라인 + SETUP.md | 완료 |
| 10 | 이미지 스위트 | 완료 |
| 11 | 오디오 스위트 | 완료 (OGG 출력은 코어 인코더 부재로 제외) |
| 12 | 스토어 자산 (아이콘·스크린샷 13장·문구 en/ko) | 완료 (`pnpm --filter @filekit/tooling icons|screenshots|listing` → `dist/listing/`) |
| 13 | 접근성·시각 회귀·최종 점검 | 완료 |

## 구현 중 스펙에서 달라진 점
- 무료 한도 파일 수 1 → 3 (병합이 무료에서 동작해야 하므로)
- OGG 출력 제외 (동봉 ffmpeg 코어에 vorbis 인코더 없음). 입력으로는 지원
- HEIC 디코딩은 워커가 아닌 메인 스레드에서 수행 (라이브러리가 document 필요)
- 스토어 게시 스크립트는 직접 작성하지 않고 PlasmoHQ/bpp 액션 사용

## 사용자가 할 일 (한 번만)
`docs/SETUP.md` 순서대로. 요약:
1. Chrome 개발자 등록 $5 (유일한 비용) + Edge·Firefox 개발자 계정 (무료)
2. Polar 조직·본인확인·제품 4개
3. Cloudflare Pages 프로젝트 + GitHub Secrets/Variables
4. 확장 3개 × 스토어 3곳 첫 등록 (문구·스크린샷은 `pnpm --filter @filekit/tooling listing && pnpm --filter @filekit/tooling screenshots` 로 `dist/listing/` 에 생성)
5. `git tag ext-pdf@1.0.0 && git push --tags`

## 다음 세션에서 할 수 있는 것
- 스토어 심사 거절 시 이슈를 보고 수정
- 8주 데이터 후 스펙 §10 기준으로 기능 추가 (OGG 출력이 필요하면 커스텀 ffmpeg 코어)
