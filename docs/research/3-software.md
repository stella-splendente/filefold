# 보고서 3: 소프트웨어 자산 (2026-09-21)
핵심 전제: 한국 거주자 Stripe 불가 → ExtensionPay/Poe/GPT Store/Stripe Managed Payments 탈락. 가능한 MoR: Polar(한국 명시), Lemon Squeezy(한국 은행 지급, 신규가입 열림), Gumroad(KRW), Paddle(심사형).
| 방법 | 비용 | 정책 | 수익 근거 | 지속 수작업 | 판정 |
| 브라우저 확장 freemium + Polar/LS 라이선스키 | Chrome $5 | AI코드 금지 없음, MV3, 2026-08 정책 강화 | Easy Folders $3.7k MRR/6개월(적극 홍보 전제), ChatBackup 누적 $400; 94% 무료 | 대상 사이트 DOM 의존시 깨짐, 심사 재제출 | MAYBE (마케팅 0이면 $0~100) |
| Google Play 유틸+AdMob | $25, 12명 테스터×14일 | 저가치 앱 정책 강화(2025 175만 앱 차단) | 배너 eCPM $0.5-1.5, ₩50만엔 수천 DAU 필요 | 연1회 targetSDK 강제 업데이트 | MAYBE-낮음 |
| Apify Actor pay-per-event | 0 | 렌탈 2026-10 종료→종량제, 80% 배분 | 평균 $470/개발자(극단 편중), 다수 $0 | 스크레이퍼 깨짐, 분기 5-10h | MAYBE (완전 무인 불가) |
| RapidAPI | - | Nokia 인수 후 텔코 중심 | 개인 사례 없음 | - | NO |
| Shopify 앱 | 0 | 심사 까다로움 | 중앙값 <$1k, 다수 $0 | 리뷰·지원이 랭킹 | NO |
| WordPress+Freemius | 7% | 2026-09 AI 보안심사 | 전환 1-3% | 호환·포럼 | NO |
| Obsidian 유료 플러그인 | 0 | 2026-05 Paid 허용 | 검증 사례 부족 | API 변경 | MAYBE-낮음 |
| Raycast/VS Code | - | 유료 결제 수단 없음 | - | - | NO |
| GPT Store/Poe/HF/OpenRouter/Replicate | - | 미국 초대제 or 프로그램 없음 | - | - | NO |
| 마이크로 SaaS CF Workers+Polar | 0 | - | $300-500 MRR 제품 존재 | 계정 있으면 CS → 계정 없는 클라이언트 전용 설계 | MAYBE (확장과 동일) |
| GitHub Sponsors | 0 | - | 소액 | 이슈 대응 | NO |
| CodeCanyon | 50% 수수료 | 판매 -70% | 붕괴 | 6개월 지원 의무 | NO |
| Gumroad 보일러플레이트 | 10%+$0.5 | - | AI 보일러플레이트 극포화 | 낮음 | MAYBE-낮음 |
| 크몽 전자책 | ~20%+3.3% | AI 원문 지양 | 누적 ₩100만 넘는 건 5% | 문의 응답 | MAYBE-낮음 |
| 카카오 이모티콘 | 0 | AI 제작물 입점 제한 유지 | - | - | NO |
| 스마트스토어 디지털 | 3.74%+ | 자동발송 근거 없음 | - | CS | NO |
Top3: 1 브라우저 확장 freemium(3스토어 동시, DOM 비의존 기능, 계정 없음, 오프라인 라이선스), 2 Apify Actor 포트폴리오(공식 API/정형 데이터 대상), 3 Play 오프라인 유틸 광고.
실격: ExtensionPay/Poe/Stripe, GPT Store, Mellowtel(봇넷 논란), CodeCanyon, RapidAPI, Shopify/WP, 카카오 이모티콘, Raycast/VS Code, HF/OpenRouter.
판정: 완전무인+6개월+₩50만 동시 만족 검증 사례 없음. 최근접은 확장, 초기 1-2개월 리스팅 최적화 노동을 "설정"으로 볼 때만 MAYBE.
출처: stripe.com/global, polar.apidocumentation.com supported-countries, docs.lemonsqueezy.com supported-countries, developer.chrome.com/blog/cws-policy-updates-2026, indiehackers.com easy-folders, extensionpay.com/articles, help.apify.com/12800725, support.google.com/googleplay 14151465, obsidian.md/blog/future-of-plugins, therepository.email envato 50%, cyberinsider.com mellowtel, news1.kr 5743296
