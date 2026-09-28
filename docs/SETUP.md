# 한 번만 하는 셋업 (사용자용)

이 문서의 항목만 끝내면 이후 배포·업데이트는 GitHub Actions가 합니다. 총 예상 소요 2~3시간. 비용은 1번의 $5 뿐입니다.

체크리스트 순서대로 진행하고, 각 단계에서 얻은 값은 마지막 표에 정리된 이름으로 GitHub 저장소의 **Settings → Secrets and variables → Actions** 에 넣습니다. Secret(비밀)과 Variable(공개 가능)을 구분해 두었습니다.

---

## 0. GitHub 저장소 (10분)

1. GitHub에서 **공개(Public)** 저장소 `filefold` 생성 (공개여야 Actions·Pages 무료 한도가 넉넉합니다).
2. 로컬에서 푸시:
   ```bash
   cd ~/Desktop/ai/filekit
   git remote add origin git@github.com:<계정>/filefold.git
   git push -u origin main
   ```
3. 저장소 **Settings → Actions → General → Workflow permissions** 에서 "Read and write permissions" 선택 (실패 시 이슈 자동 생성용).

## 1. Chrome 웹스토어 (30분, $5)

1. https://chrome.google.com/webstore/devconsole 에서 개발자 등록, $5 결제, 구글 계정 2단계 인증 켜기.
2. **첫 등록 (스위트마다 1회)**: "새 항목" → `apps/ext-pdf/.output/ext-pdf-1.0.0-chrome.zip` 업로드 → 스토어 등록정보 탭에 `dist/listing/pdf/en.md` 내용 붙여넣기(한국어 탭은 `ko.md`) → 스크린샷 `dist/listing/pdf/screenshots/*.png` 업로드 → 개인정보 탭: 단일 목적 설명·권한 정당화는 `dist/listing/pdf/privacy-justification.md`, 개인정보처리방침 URL은 `https://<사이트 도메인>/privacy/` → 심사 제출.
   - 심사 통과 후 스토어 URL(`https://chromewebstore.google.com/detail/<id>`)을 Variable `STORE_CHROME_PDF` 에, 항목 ID(32자)를 아래 bpp 키의 `extId` 에 씁니다.
3. **API 키 발급 (1회, 모든 스위트 공용)**: https://github.com/PlasmoHQ/bpp#chrome-web-store 의 안내대로 Google Cloud 프로젝트에서 OAuth 클라이언트 ID·시크릿을 만들고 refresh token을 얻습니다. (안내 페이지의 단계가 화면 그대로입니다. 약 15분.)

## 2. Edge 애드온 (20분, 무료)

1. https://partner.microsoft.com/dashboard/microsoftedge 에서 개발자 계정 생성.
2. **첫 등록 (스위트마다 1회)**: 새 확장 → `ext-pdf-1.0.0-edge.zip` 업로드 → 등록정보는 Chrome과 같은 파일 사용 → 제출.
   - 제품 ID(GUID, 개요 페이지 URL에 있음)를 bpp 키의 `productId` 에, 스토어 URL을 `STORE_EDGE_PDF` 에.
3. **API 키**: 대시보드 **Publish API** → "Create API credentials" → Client ID와 API key 를 bpp 키에.

## 3. Firefox 애드온 (20분, 무료)

1. https://addons.mozilla.org/developers/ 에서 계정 생성.
2. **첫 등록 (스위트마다 1회)**: "새 부가 기능 제출" → "이 사이트에서" → `ext-pdf-1.0.0-firefox.zip` 업로드 → 소스 코드 요구 시 `ext-pdf-1.0.0-sources.zip` 업로드 → 등록정보 붙여넣기 → 제출.
   - 확장 ID는 이미 manifest에 `pdf@filefold.app` 으로 박혀 있어 bpp 키의 `extId` 에 그대로 씁니다. 스토어 URL은 `STORE_FIREFOX_PDF` 에.
3. **API 키**: https://addons.mozilla.org/developers/addon/api/key/ 에서 JWT issuer·secret 발급.

## 4. Polar 결제 (30분, 무료·판매 시 수수료만)

1. https://polar.sh 에서 조직 생성 → 본인 확인(KYC) → 정산 계좌 등록(한국 은행 가능).
2. 제품 4개 생성. 각 제품에 **Benefit → License Keys** 추가, 활성화 한도(Activation limit) **3**, 만료 없음.
   | 제품 | 가격 | Benefit 이름 |
   |---|---|---|
   | Filefold PDF Tools Pro | $9.99 일회성 | pdf |
   | Filefold Image Tools Pro | $9.99 일회성 | image |
   | Filefold Audio Tools Pro | $9.99 일회성 | audio |
   | Filefold All Tools Pro | $19.99 일회성 | bundle |
3. 각 제품의 **Checkout Link** 를 만들어 Variable `POLAR_CHECKOUT_PDF` / `_IMAGE` / `_AUDIO` / `_BUNDLE` 에.
4. 조직 ID(Settings → General)를 Variable `POLAR_ORG_ID` 에.
5. 각 Benefit의 ID(benefit 상세 URL 끝의 `benefit_...`)로 아래 JSON을 만들어 Variable `POLAR_BENEFITS` 에 한 줄로 넣습니다.
   ```json
   {"benefit_PDF_ID":["pdf"],"benefit_IMAGE_ID":["image"],"benefit_AUDIO_ID":["audio"],"benefit_BUNDLE_ID":["pdf","image","audio"]}
   ```

## 5. Cloudflare Pages (완료)

Cloudflare Pages 프로젝트 `filefold`가 GitHub 저장소와 직접 연결되어 있습니다. `main`에 푸시하면 Cloudflare가 스스로 빌드·배포합니다. 별도 토큰이나 워크플로가 필요 없습니다.

- 주소: https://filefold.pages.dev (도메인을 사면 Pages 프로젝트 → Custom domains 에서 연결하고 환경변수 `SITE_URL`만 바꿉니다)
- 빌드 설정: 명령 `pnpm --filter web build`, 출력 `apps/web/dist`, 환경변수 `NODE_VERSION=24`, `SITE_URL=https://filefold.pages.dev`
- 사이트에서 쓰는 Polar·스토어 링크는 같은 화면의 환경변수에 `PUBLIC_POLAR_ORG_ID`, `PUBLIC_POLAR_BENEFITS`, `PUBLIC_POLAR_CHECKOUT_PDF|IMAGE|AUDIO|BUNDLE`, `PUBLIC_STORE_CHROME|EDGE|FIREFOX_PDF|IMAGE|AUDIO` 이름으로 넣습니다(4·6단계 값이 나온 뒤).
- 방문 통계는 Pages 프로젝트의 Web Analytics 를 켜면 무료로 잡힙니다(쿠키 없음).

## 6. GitHub Secrets / Variables 정리표

| 이름 | 종류 | 값 |
|---|---|---|
| `BPP_KEYS_PDF` | Secret | 아래 JSON (PDF 스위트용) |
| `BPP_KEYS_IMAGE` | Secret | 같은 형식, image 스위트 ID들 |
| `BPP_KEYS_AUDIO` | Secret | 같은 형식, audio 스위트 ID들 |
| `POLAR_ORG_ID` | Variable | 4-4 |
| `POLAR_BENEFITS` | Variable | 4-5 JSON |
| `POLAR_CHECKOUT_PDF` 등 4개 | Variable | 4-3 |
| (사이트용 값은 Cloudflare Pages 환경변수에, 5단계 참고) | | |

`BPP_KEYS_*` JSON 형식 (https://github.com/PlasmoHQ/bpp 와 동일):
```json
{
  "chrome":  { "clientId": "...", "clientSecret": "...", "refreshToken": "...", "extId": "<Chrome 항목 ID>" },
  "edge":    { "clientId": "...", "apiKey": "...", "productId": "<Edge 제품 GUID>" },
  "firefox": { "apiKey": "<JWT issuer>", "apiSecret": "<JWT secret>", "extId": "pdf@filefold.app" }
}
```

## 7. 첫 배포

모든 값이 들어가면:
```bash
git tag ext-pdf@1.0.0 && git push --tags     # PDF 스위트 세 스토어에 업데이트 게시
```
이후 기능이 추가되면 `package.json` 버전을 올리고 같은 방식으로 태그만 붙입니다. 심사는 스토어가 하고 통과하면 자동 공개됩니다. 실패하면 저장소에 이슈가 자동으로 열립니다.

## 8. 자주 묻는 것

- **Stripe가 없어도 되나요?** 네. Polar가 판매대행(Merchant of Record)으로 세금·영수증·환불을 처리하고 한국 계좌로 정산합니다.
- **사업자 등록?** 해외 플랫폼 정산 소득은 종합소득세 신고 대상입니다. 매출이 생기면 세무사 상담을 권합니다(이 문서의 범위 밖).
- **도메인은 언제?** 사이트 방문이 생기면 `filefold.app`(약 ₩20,000/년)을 사고 `SITE_URL` 과 Cloudflare Pages 커스텀 도메인만 바꾸면 됩니다.
