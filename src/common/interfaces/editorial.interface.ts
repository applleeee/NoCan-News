import { EditorialStance } from '../constants';

/**
 * 수집된 사설 아이템
 */
export interface Editorial {
  title: string;
  link: string;
  pubDate: string;
  content?: string; // 스크래핑 후 본문
  stance: EditorialStance;
}

/**
 * AI가 생성한 사설 통합 분석
 */
export interface EditorialSynthesis {
  topic: string;
  conflict: string; // 핵심 쟁점
  argumentA: string; // 보수 측 논리
  argumentB: string; // 진보 측 논리
  synthesis: string; // 구조적/시대적 의미
}

/**
 * 뉴스레터 데이터
 */
export interface NewsletterData {
  date: string;
  protectionLog: string;
  processedNews: import('./news-item.interface').ProcessedNews[];
  editorialSynthesis?: EditorialSynthesis;
}
