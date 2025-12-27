# Project: NoCan News(News Noise Canceling)

## 1. Project Overview

- **Description:** 불안을 파는 뉴스를 차단하고, 안도감과 통찰을 파는 이메일 큐레이션 서비스.
- **Core Value:** "세상의 소음은 끄고, 구조적 맥락만 남긴다 (Noise Off, Context On)."
- **Target Audience:** 자극적인 정보에 지쳤지만, 세상의 흐름은 놓치고 싶지 않은 지적 욕구가 있는 개인.
- **Platform:** Daily Email Newsletter (MVP)

## 2. Core Philosophy (Based on Peter Wessel Zapffe)

1.  **Isolation (고립):**
    - 살인, 성범죄, 연예 가십, 정치적 비방 등 '독성 정보(Toxic Info)'를 AI가 사전 차단.
    - "오늘 당신은 300건의 쓰레기 정보로부터 보호받았습니다"라는 효능감 제공.
2.  **Anchoring (고착):**
    - 불안을 유발하는 낚시성 헤드라인을 '건조한 팩트'로 중화(Neutralize).
    - 파편화된 정보를 [현상-맥락-함의]의 구조로 묶어 독자에게 지적 통제감 제공.

---

## 3. Architecture & Tech Stack

### 3.1 Tech Stack

- **Language:** TypeScript
- **Framework:** NestJS (Standalone Application Mode)
- **Data Collection:** `rss-parser` (Google News RSS)
- **Scraping:** `cheerio` (본문 채굴용 - 제한적 사용)
- **AI Engine:** Gemini API (`gemini-2.5-flash` for cost efficiency)
- **Email:** `nodemailer` (Gmail SMTP)
- **Infrastructure:** GitHub Actions (Cron Scheduler) - Serverless, Cost $0.

### 3.2 System Flow

1.  **Trigger:** GitHub Actions (Every day at 07:00 KST)
2.  **Collect:** Google News RSS Fetch (Business, Tech, Policy, Global, Editorial)
3.  **Filter (AI):** 제목 기반 독성(Toxic) 기사 제거.
4.  **Cluster & Scrape:**
    - 일반 뉴스: 제목/스니펫 기반 처리.
    - 사설(Editorial): 좌/우 매칭 후 본문 스크래핑 (`cheerio`).
5.  **Process (AI):**
    - Headline Detox (제목 중화).
    - Micro-Briefing (3줄 구조화 요약).
    - Editorial Synthesis (사설 통합 분석).
6.  **Render:** HTML Email Template Generation.
7.  **Send:** SMTP 발송 -> User Inbox.
8.  **Exit:** Process Termination.

---

## 4. Key Features (Content Structure)

### Part 1. Protection Log (방어 로그)

- **목적:** Isolation의 가시화. 서비스의 효능감 증명.
- **형태:**
  > "오늘 AI가 총 2,450건을 스캔하여 **살인/범죄 120건, 정치비방 340건**을 차단했습니다."

### Part 2. Headline Detox & Micro-Briefing (뉴스 중화)

- **목적:** Anchoring. 클릭 없이도 맥락 이해.
- **구성:**
  - **Category:** Business / Tech / Policy / Global
  - **Display:**
    - ~~[원문] 개미들 곡소리... 삼성전자 4만전자 가나?~~ (취소선, 흐리게 처리)
    - **[AI 수정] 삼성전자, 업황 둔화로 52주 신저가 기록** (볼드체, 건조한 톤)
  - **3-Line Insight:**
    1.  **Fact:** 무슨 일이 있었는가?
    2.  **Context:** 왜 일어났는가? (구조적 원인)
    3.  **Implication:** 무엇을 의미하는가?

### Part 3. Editorial Synthesis (사설 통합 - Killer Feature)

- **목적:** 편향 제거 및 쟁점 파악. (정반합 분석)
- **로직:**
  1.  보수(조중동) vs 진보(한경오) 사설 RSS 수집.
  2.  동일 쟁점(예: 의대 증원) 매칭.
  3.  AI가 양측 주장을 통합하여 **[쟁점 - 양측 논리 - 구조적 본질]** 리포트 작성.

---

## 5. Data Strategy (Google News RSS)

### 5.1 RSS URLs (Constants)

`constants.ts`에 정의하여 관리.

```typescript
export const GOOGLE_RSS_URLS = {
  // Base Template for Custom Queries
  // Usage: Replace {KEYWORD} with URL-encoded query string
  SEARCH_BASE:
    '[https://news.google.com/rss/search?q=](https://news.google.com/rss/search?q=){KEYWORD}&hl=ko&gl=KR&ceid=KR:ko',

  // Fixed Topics (Topic IDs)
  // Business (Economy)
  SECTION_BUSINESS:
    '[https://news.google.com/rss/topics/CAAqIggBCiKAQAqJggBCiJCAQAqSVgwLWpvaW50LWNkb21pbmlvbi1uZXdzLXNlY3Rpb25CbGdACioJCg0KCQn5EBIGCn0QAhABGgkKCQn5EBIGCn0QAhABKgkICCIHCgdlbBAK?hl=ko&gl=KR&ceid=KR%3Ako](https://news.google.com/rss/topics/CAAqIggBCiKAQAqJggBCiJCAQAqSVgwLWpvaW50LWNkb21pbmlvbi1uZXdzLXNlY3Rpb25CbGdACioJCg0KCQn5EBIGCn0QAhABGgkKCQn5EBIGCn0QAhABKgkICCIHCgdlbBAK?hl=ko&gl=KR&ceid=KR%3Ako)',

  // Science & Technology
  SECTION_TECH:
    '[https://news.google.com/rss/topics/CAAqIggBCiKAQAqJggBCiJCAQAqSVgwLWpvaW50LWNkb21pbmlvbi1uZXdzLXNlY3Rpb25CbGdACioJCg0KCQn5EBIGCn0QBxABGgkKCQn5EBIGCn0QBxABKgkICCIHCgdlbBAK?hl=ko&gl=KR&ceid=KR%3Ako](https://news.google.com/rss/topics/CAAqIggBCiKAQAqJggBCiJCAQAqSVgwLWpvaW50LWNkb21pbmlvbi1uZXdzLXNlY3Rpb25CbGdACioJCg0KCQn5EBIGCn0QBxABGgkKCQn5EBIGCn0QBxABKgkICCIHCgdlbBAK?hl=ko&gl=KR&ceid=KR%3Ako)',

  // World (Global)
  SECTION_WORLD:
    '[https://news.google.com/rss/topics/CAAqJggBCiJCAQAqSVgwLWpvaW50LWNkb21pbmlvbi1uZXdzLXNlY3Rpb25CbGdACioJCg0KCQn5EBIGCn0QwwEYCQgIIgcKB2VsEAo?hl=ko&gl=KR&ceid=KR%3Ako](https://news.google.com/rss/topics/CAAqJggBCiJCAQAqSVgwLWpvaW50LWNkb21pbmlvbi1uZXdzLXNlY3Rpb25CbGdACioJCg0KCQn5EBIGCn0QwwEYCQgIIgcKB2VsEAo?hl=ko&gl=KR&ceid=KR%3Ako)',
};
```

### 5.2 Custom Query Strategy

안전한 정보를 위해 `SEARCH_BASE`에 삽입할 키워드 전략.

1.  **Policy & Society (정책 및 사회 구조):**
    - Query: `정책 OR 입법 OR 제도 OR 인구 OR 노동 OR 교육 -사고 -사망 -포토 -부고 when:1d`
    - 의도: 사건사고 배제, 시스템/구조적 변화 집중.
2.  **Editorial (사설):**
    - Conservative: `site:chosun.com OR site:joongang.co.kr 사설 when:2d`
    - Liberal: `site:hani.co.kr OR site:khan.co.kr 사설 when:2d`

---

## 6. AI Prompt Engineering Strategy

### Role 1: The Filter & Detoxifier

- **Input:** News List (Title + Snippet)
- **Task:**
  1.  `isToxic`: True if crime, gossip, political strife.
  2.  `rewrittenTitle`: Dry, factual tone. No emotional adjectives.
  3.  `insight`: Fact / Context / Implication extraction (JSON format).

### Role 2: The Synthesizer (For Editorials)

- **Input:** Full text of 2 opposing editorials.
- **Task:**
  - 절대 어느 한쪽 편을 들지 말 것.
  - 감정적 언어를 배제하고 '논리적 쟁점'만 추출할 것.
  - **Output Structure:**
    - **Conflict:** 무엇 때문에 싸우는가? (핵심 쟁점)
    - **Argument A:** 보수 측 논리 요약.
    - **Argument B:** 진보 측 논리 요약.
    - **Synthesis:** 이 갈등이 시사하는 구조적/시대적 의미.

### Gemini API 무료 제한

- 분당 최대 요청 수 : 5
- 분당 최대 입력 토큰 수 : 250k
- 일일 최대 요청 수 : 20

---

## 7. Deployment (GitHub Actions)

### Workflow File (`.github/workflows/daily-news.yml`)

- **Schedule:** `cron: '0 22 * * *'` (UTC 22:00 = KST 07:00 Next Day)
- **Jobs:**
  - Checkout Code
  - Setup Node.js
  - Install Dependencies
  - Run NestJS Script (`npm run start:prod`)
- **Secrets (GitHub Repo Settings):**
  - `GEMINI_API_KEY`
  - `GMAIL_USER`
  - `GMAIL_PASS` (App Password)
  - `NEWSLETTER_RECIPIENTS` (comma-separated emails)

---

## 8. Development Roadmap (MVP)

### Phase 1: Data Pipeline (Local Test)

- [ ] NestJS Standalone App 프로젝트 세팅.
- [ ] `rss-parser` 설치 및 Google RSS(Business, Tech) 수집 테스트.
- [ ] Custom Query(정책, 사설) RSS 수집 테스트 및 데이터 확인.

### Phase 2: AI Integration

- [ ] Gemini API 연동 (`@google/generative-ai` npm package).
- [ ] **Prompt Tuning 1:** 일반 뉴스 제목 중화 및 독성 필터링 성능 검증.
- [ ] **Prompt Tuning 2:** 사설 매칭(Matching) 및 통합 요약(Synthesis) 퀄리티 검증.

### Phase 3: Email & Deploy

- [ ] HTML 이메일 템플릿 코딩 (취소선 스타일, 가독성 최적화).
- [ ] `nodemailer` 발송 테스트.
- [ ] GitHub Actions 설정 파일 작성 및 자동 발송 확인.
