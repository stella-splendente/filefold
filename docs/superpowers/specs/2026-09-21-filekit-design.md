# filekit 설계 스펙

- 작성일: 2026-09-21
- 상태: 사용자 승인된 설계 (구현 계획 작성 전)
- 작업명: filekit (브랜드명은 §11 절차로 확정)

## 1. 목적과 제약

초기자본 0, 셋업 이후 사람의 손이 필요 없는 자산형 수익 구조를 만든다. 운영자는 한국 거주자이며, 일상 조작이 불가능하다는 가정으로 설계한다.

하드 제약:

| 제약 | 설계 반영 |
|---|---|
| 고정비 0 | Chrome 개발자 등록 $5 일회성 외 지출 없음. 호스팅·CI·결제대행 모두 무료 티어 또는 판매 시 수수료만 |
| 셋업 후 무인 | 서버·회원 계정·고객 문의 창구를 두지 않는다. 업데이트 배포는 CI가 스토어 API로 수행 |
| 서버 최소화 | 서버 0. 모든 처리는 사용자 브라우저에서, 라이선스 검증은 Polar 공개 API 직접 호출 |
| 한국 정산 | Stripe 불가이므로 Polar(판매대행, 한국 지원)를 사용 |
| 수익 증거 기반 | `docs/research/` 조사 결과에 따라 "마켓플레이스가 트래픽을 주는 자산"만 선택 |

기대치: 첫 6개월 월 0~15만원, 12개월 이후 월 50만원 가능성. 검증된 무인 사례가 없음을 인지하고 시작한다.

## 2. 제품 정의

브라우저 안에서만 동작하는 파일 도구 세트. 파일이 기기 밖으로 나가지 않는다는 점이 서버 업로드형 경쟁 서비스와의 차별점이다.

### 2.1 확장 프로그램 3종 (스위트)

| 스위트 | v1 기능 | 핵심 라이브러리 |
|---|---|---|
| PDF | 병합, 분할, 압축(내장 이미지 재압축), 이미지→PDF, PDF→이미지, 회전, 페이지 순서 변경, 페이지 삭제 | pdf-lib, pdfjs-dist |
| 이미지 | 변환(HEIC, PNG, JPG, WebP, AVIF 상호), 압축, 크기 조절 | jSquash wasm 코덱, libheif wasm |
| 오디오 | 변환(입력 mp3/wav/ogg/flac/m4a 등 → 출력 mp3/wav/m4a. 동봉 ffmpeg 코어에 vorbis 인코더가 없어 OGG 출력은 v1 제외), 자르기, 압축, 동영상 파일에서 오디오 추출 | ffmpeg.wasm 단일 스레드 빌드 |

Chrome/Edge/Firefox 동시 지원. Manifest V3. 원격 코드 없음(wasm은 패키지에 동봉). 스위트 단위로 나눈 이유는 Chrome "단일 목적" 정책 준수와 스토어 첫 등록 횟수(3×3=9회) 최소화의 균형이다.

### 2.2 도구 사이트

- Astro 정적 사이트, Cloudflare Pages 무료 호스팅. 초기 도메인은 `*.pages.dev`, 사용자 유입이 생기면 본인 도메인 구매(선택, 연 약 ₩15,000).
- 기능 하나당 페이지 하나. 예: `/compress-pdf`, `/merge-pdf`, `/heic-to-jpg`, `/mp4-to-mp3`. 한국어판은 `/ko/` 접두.
- 각 페이지는 실제로 도구가 동작한다(확장과 같은 `packages/core` 사용). 얇은 SEO 페이지가 아니다.
- 각 페이지에 확장 설치 버튼, Pro 구매 버튼, 무료 한도 안내.
- 기능 목록은 `tools.config.ts` 하나에서 정의하고 페이지·사이트맵·JSON-LD·OG 이미지·스토어 설명 초안을 여기서 생성한다.

### 2.3 언어

영어 기본, 한국어 동봉. 확장은 `_locales/en`, `_locales/ko`. 사이트는 두 경로. 문구는 `packages/ui/i18n`에서 단일 관리.

## 3. 수익 모델

| 등급 | 조건 |
|---|---|
| Free | 모든 기능 사용 가능. 한 번에 파일 3개까지(병합 같은 다중 파일 도구가 무료에서도 동작하도록 구현 중 1→3으로 조정), 파일당 25MB, 하루 10회 |
| Pro | 일괄 처리(파일 수 제한 없음), 파일당 2GB, 횟수 제한 없음 |

가격: 스위트당 $9.99 평생, 3종 묶음 $19.99 평생. 일회성으로 정한 이유는 해지·환불 대응이 구조적으로 없어져 무인 운영에 맞기 때문. 월정액은 8주 데이터 확인 후 검토.

결제 흐름:

1. 확장 또는 사이트의 "Pro" 버튼이 Polar 체크아웃 링크를 새 탭으로 연다.
2. Polar가 결제·세금·영수증·환불을 처리하고 라이선스 키를 이메일로 보낸다.
3. 사용자가 확장 옵션 페이지(또는 사이트의 키 입력란)에 키를 붙여넣는다.
4. 클라이언트가 `POST /v1/customer-portal/license-keys/activate` 를 조직 ID와 함께 호출한다(인증 불필요). 성공 시 활성화 ID를 로컬에 저장한다.
5. 이후 7일마다 `validate`로 재검증한다. 실패 시 마지막 성공 시점부터 30일 유예 후 Free로 내려간다.

활성화 한도: 키당 기기 3대. 묶음 상품은 하나의 키로 세 스위트 모두 통과(benefit 하나를 세 제품에 연결).

무료 한도 상태(일일 횟수)는 `chrome.storage.local` / `localStorage`에 저장한다. 우회 가능하지만 무인 운영 원칙상 서버 검증을 두지 않는다. 이는 의도된 단순화다.

## 4. 코드 구조

```
filekit/
├── packages/
│   ├── core/          # 처리 엔진. 순수 브라우저 코드. Web Worker에서 실행
│   │   ├── pdf/       # merge, split, compress, toImages, fromImages, rotate, reorder, deletePages
│   │   ├── image/     # convert, compress, resize
│   │   ├── audio/     # convert, trim, compress, extractFromVideo
│   │   └── worker/    # 작업 큐, 진행률 이벤트, 취소
│   ├── ui/            # 드롭존, 진행 표시, 결과 다운로드, 한도 안내, i18n(en, ko)
│   └── license/       # Polar activate/validate, 캐시, 유예, Free 한도 카운터
├── apps/
│   ├── ext-pdf/       # WXT 기반 MV3. chrome/edge/firefox 빌드 타깃
│   ├── ext-image/
│   ├── ext-audio/
│   └── web/           # Astro. tools.config.ts에서 페이지 생성
├── tooling/
│   └── publish/       # 스토어 3곳 업로드·게시 스크립트
├── tests/
│   ├── fixtures/      # 샘플 pdf/png/heic/wav/mp4 (소용량)
│   └── e2e/           # Playwright
└── docs/
    ├── superpowers/   # specs, plans
    └── research/      # 2026-09 시장 조사 3건
```

도구: pnpm 워크스페이스, TypeScript, Vitest, Playwright, WXT, Astro. 파일 500줄 이하 유지.

경계 규칙:

- `core`는 DOM과 확장 API를 모른다. 입력은 `File | Blob`, 출력은 `Blob` + 메타데이터. 이 규칙 덕에 확장과 웹이 같은 코드를 쓴다.
- `ui`는 `core`의 작업 인터페이스만 안다.
- `license`는 저장소 추상화(`chrome.storage` 또는 `localStorage`)를 주입받는다.
- 앱들은 조립만 한다.

## 5. 배포·운영 파이프라인 (GitHub Actions, 공개 저장소 무료)

| 트리거 | 동작 |
|---|---|
| 태그 `ext-<suite>@x.y.z` | 해당 스위트 3개 스토어용 zip 빌드 → Chrome Web Store API 업로드+게시 요청, Edge Add-ons API 업로드+게시 요청, AMO API 업로드(listed). 심사는 스토어가 수행. 결과를 워크플로 요약에 기록, 실패 시 GitHub 이슈 자동 생성 |
| `main` 푸시 | 웹 빌드 → Cloudflare Pages 배포 |
| 매주 월요일 | `pnpm audit`, 전체 단위·e2e 테스트, 실패 시 이슈 생성 |

비밀값(GitHub Secrets): Chrome OAuth 클라이언트 ID/시크릿/리프레시 토큰, Edge 클라이언트 ID/API 키, AMO JWT 발급자/시크릿, Cloudflare API 토큰, Polar 조직 ID(공개값이지만 함께 관리).

관측: 서버 없이 Cloudflare Web Analytics(사이트), 각 스토어 대시보드(설치 수), Polar 대시보드·이메일(매출). 별도 수집 코드 없음.

## 6. 사람이 한 번만 하는 일

Claude Code가 문구, 아이콘, 스크린샷, 개인정보 처리 설명, 권한 정당화 문구를 전부 준비하고 사용자는 붙여넣기·결제·본인확인만 한다.

1. Google 개발자 계정 등록 $5, 2단계 인증 활성화
2. Microsoft Partner Center 개발자 계정, Firefox AMO 계정 생성 (무료)
3. Polar 조직 생성, 본인 확인, 정산 계좌 등록, 제품 4개(스위트 3 + 묶음 1) 생성
4. Cloudflare Pages 프로젝트 연결, GitHub 저장소 Secrets 등록
5. 확장 3개 × 스토어 3곳 첫 등록 (9회). 이후 버전 업데이트는 CI가 수행

예상 소요 2~3시간. 이 단계는 "셋업"으로 간주하며 무인 원칙의 예외다.

## 7. 오류 처리

- 처리 실패: 원본은 메모리에만 있어 손상되지 않는다. 오류 종류(지원하지 않는 형식, 손상 파일, 메모리 부족, 취소)를 구분해 표시하고 재시도를 제공한다.
- 대용량: 무료 25MB, Pro 2GB. 브라우저 메모리 한계에 걸리면 안내 후 중단한다(부분 결과 없음).
- 라이선스: 네트워크 실패는 캐시 상태 유지. 키 무효(환불·회수)는 즉시 Free 전환. 유예 30일.
- 배포: 스토어 API 실패는 이슈 자동 생성으로 다음 세션에 넘긴다. 심사 거절도 동일.
- 정책 변경: 스토어 정책 공지는 자동 감시하지 않는다(YAGNI). 심사 거절 이슈가 곧 신호다.

## 8. 테스트

- `core`: 픽스처 기반 단위 테스트. 각 기능은 성공 경로 1개 + 실패 경로 1개 이상. 라인 커버리지 80% 이상.
- `license`: activate/validate 모의 서버로 성공, 실패, 유예 만료, 기기 초과 케이스.
- e2e(Playwright): Chromium에 확장 로드 후 PDF 병합·이미지 변환·오디오 변환 각 1회 실제 실행. 웹은 대표 페이지 3개에서 동일 흐름.
- 시각 회귀: 웹 대표 페이지 375px·1440px 스크린샷 비교.
- 접근성: 드롭존·버튼 키보드 조작, 진행 상태 aria-live.

## 9. v1 범위 밖

OCR, 동영상 변환, 회원 계정, 클라우드 저장, 광고(AdSense), Safari, 모바일 앱, 월정액, 서버 측 한도 검증, 자동 정책 감시.

## 10. v1 이후 판단 기준

출시 후 8주 데이터(설치 수, 사이트 세션, Pro 전환)를 본 뒤:

- 설치·검색 유입이 많은 기능 계열을 우선 확장한다.
- 사이트 세션이 월 1만을 넘으면 도메인 구매와 AdSense를 검토한다.
- 환불률이 5%를 넘으면 무료 한도를 조정한다.

## 11. 브랜드명 확정 절차 (구현 계획 첫 작업)

후보 3개를 만들고 각각 `.com` 또는 `.app` 도메인 가용성, 세 스토어 검색 결과 중복, 상표 검색(간단 조회)을 확인해 하나를 고른다. 확정 전까지 코드 작업명은 filekit.

## 12. 근거 자료

- `docs/research/1-marketplaces.md`: 디지털 자산 마켓 조사
- `docs/research/2-content.md`: 콘텐츠·트래픽 조사
- `docs/research/3-software.md`: 소프트웨어 자산 조사

세 조사가 독립적으로 "무인 + 6개월 + ₩50만" 검증 사례 없음, 병목은 트래픽, 마켓플레이스 유통 자산이 최선이라는 같은 결론에 도달했다. 스토어 API 사실 확인(2026-09-21): Chrome Web Store API는 업로드·게시 요청 가능하나 심사는 필수, Edge Add-ons API는 업데이트 전용(첫 등록은 Partner Center), AMO API는 listed 버전도 업로드 가능하나 심사 대기, Polar 라이선스 키 activate/validate는 인증 없이 조직 ID로 호출 가능.
