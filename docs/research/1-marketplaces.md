# 보고서 1: 디지털 자산 마켓플레이스 (2026-09-21)
결론: 완전자동+6개월 ₩500k YES 없음. 병목은 업로드가 아니라 트래픽. Gumroad 중앙값 $72/월, 44%가 $0.
| 플랫폼 | AI 허용 | 업로드 API | 한국 정산 | 수동 개입 | 판정 |
| Gumroad | 허용 | POST /v2/products | KRW 계좌 최소 ₩40k | 환불(대부분 자동) | MAYBE (외부 트래픽 필수) |
| Etsy 디지털 | 허용+AI 공개 필수 | Open API v3 createDraftListing/uploadListingFile | Payoneer | 메시지·케이스, 리스팅 $0.20 | MAYBE (내부 검색 트래픽 있음, 상한 최고) |
| KDP | 허용+공개, 주 10권 캡 | 없음 | 가능 | UI 수동 | NO |
| Adobe Stock | 허용+표시 | 비공개, 자동화 시 차단 | PayPal | 수동 submit | NO |
| Shutterstock/Canva/Envato/Pond5/Udemy | AI 금지 | - | - | - | NO |
| Freepik | 허용 | FTP(500파일 후) | Payoneer, 스페인 24% 원천 | 저단가 $0.04-0.07/DL | MAYBE(저수익) |
| Vecteezy | 허용 | SFTP 자동 인제스트+CSV | PayPal/Payoneer | 유일한 공식 봇 업로드 | MAYBE(저수익, $5/1000DL) |
| DistroKid/Spotify | 허용+AI Credits | 없음(Too Lost REST API 有) | PayPal | 1000스트림 미만 무지급, 스팸필터 | NO |
| Notion 마켓 | 허용 | 없음(수동 제출) | Stripe 8%+$0.40 | 수동 | NO |
| Creative Fabrica | 허용 | 없음 | 50% | 수동 | NO |
| POD Printful/Printify+Etsy | Etsy 규정 | API 有 | Payoneer | 배송·반품·케이스 | NO |
| Merch by Amazon | - | 없음 | 한국 미지원 | - | NO |
Top3: 1 Etsy 디지털+API 자동리스팅, 2 Gumroad API+자동 트래픽 파이프라인, 3 Vecteezy SFTP.
실격: KDP 로우콘텐츠, Adobe Stock AI, Suno→DistroKid, Merch by Amazon, Canva/Envato/Shutterstock/Pond5, Udemy AI강좌, Notion 템플릿 "$2-5K" 마케팅.
조언: 1·2 병행 + 트래픽 생성(Pinterest API, GitHub Pages SEO)까지 GitHub Actions 자동화 필요. 초기 1-2개월 수동 0 어려움(Payoneer KYC, 샵 설정, 세금서류).
출처: insightraider.com/en/state-of-gumroad-2026, github.com/antiwork/gumroad/pull/7518, etsy.com/legal/creativity, developers.etsy.com, help.etsy.com/hc/en-us/articles/16999319005207, authorsguild.org KDP AI policy, community.adobe.com similar-content, submit.shutterstock.com/help/en/articles/10594676, canva.com/help/updates-to-contributor-agreement-jan-2026, pond5.com/help/en/articles/10086182, support.distrokid.com/hc/en-us/articles/50784235803411, eezycontributors.zendesk.com SFTP, support.udemy.com Instructor-Generative-AI-Policy
