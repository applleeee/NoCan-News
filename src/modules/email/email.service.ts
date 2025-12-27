import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NewsletterData, ProcessedNews } from '../../common/interfaces';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const user = this.configService.get<string>('GMAIL_USER');
    const pass = this.configService.get<string>('GMAIL_PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      this.logger.log('Email transporter initialized');
    } else {
      this.logger.warn(
        'Gmail credentials not configured. Email sending disabled.',
      );
    }
  }

  /**
   * 카테고리 한글명 변환
   */
  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      business: '경제',
      tech: '기술',
      policy: '정책',
      world: '국제',
    };
    return names[category] || category;
  }

  /**
   * 뉴스레터 HTML 렌더링
   */
  renderNewsletter(data: NewsletterData): string {
    this.logger.log('Rendering newsletter HTML...');
    const { date, protectionLog, processedNews, editorialSynthesis } = data;

    // 카테고리별로 뉴스 그룹화
    const newsByCategory: Record<string, ProcessedNews[]> = {};
    for (const news of processedNews) {
      const cat = news.original.category;
      if (!newsByCategory[cat]) {
        newsByCategory[cat] = [];
      }
      newsByCategory[cat].push(news);
    }

    // 뉴스 섹션 HTML 생성
    let newsHtml = '';
    const categoryOrder = ['business', 'tech', 'policy', 'world'];

    for (const category of categoryOrder) {
      const newsItems = newsByCategory[category];
      if (!newsItems || newsItems.length === 0) continue;

      newsHtml += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #4a4e69; padding-bottom: 8px; margin-bottom: 16px;">
            📌 ${this.getCategoryName(category)}
          </h2>
          ${newsItems.map((news) => this.renderNewsItem(news)).join('')}
        </div>
      `;
    }

    // 사설 통합 섹션 (있는 경우)
    let editorialHtml = '';
    if (editorialSynthesis) {
      editorialHtml = `
        <div style="margin-top: 32px; padding: 16px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px;">
          <h2 style="color: #1a1a2e; font-size: 20px; margin-bottom: 16px;">
            ⚖️ 오늘의 사설 분석
          </h2>
          <p style="font-size: 16px; font-weight: 600; color: #343a40; margin-bottom: 12px;">
            ${editorialSynthesis.topic}
          </p>
          <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
            <p style="font-size: 14px; color: #495057; margin: 0;">
              <strong>🔴 핵심 쟁점:</strong> ${editorialSynthesis.conflict}
            </p>
          </div>
          <div style="background: #fff5f5; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
            <p style="font-size: 14px; color: #c92a2a; font-weight: 600; margin: 0 0 8px 0;">보수 측 논리</p>
            <p style="font-size: 14px; color: #495057; margin: 0; line-height: 1.6;">${editorialSynthesis.argumentA}</p>
          </div>
          <div style="background: #e7f5ff; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
            <p style="font-size: 14px; color: #1971c2; font-weight: 600; margin: 0 0 8px 0;">진보 측 논리</p>
            <p style="font-size: 14px; color: #495057; margin: 0; line-height: 1.6;">${editorialSynthesis.argumentB}</p>
          </div>
          <div style="background: #f1f3f5; padding: 12px; border-radius: 8px;">
            <p style="font-size: 13px; color: #495057; margin: 0;">
              <strong>💡 구조적 의미:</strong> ${editorialSynthesis.synthesis}
            </p>
          </div>
        </div>
      `;
    }

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NoCan News - ${date}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 100%; margin: 0 auto; background-color: #ffffff;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px 16px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; letter-spacing: -0.5px;">
        🔇 NoCan News
      </h1>
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">
        세상의 소음은 끄고, 구조적 맥락만 남긴다
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0 0;">
        ${date}
      </p>
    </div>

    <!-- Protection Log -->
    <div style="background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); padding: 16px; border-bottom: 1px solid #e5e7eb;">
      <p style="color: #10b981; font-size: 14px; margin: 0;">
        🛡️ ${protectionLog}
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 16px;">
      ${newsHtml}
      ${editorialHtml}
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
        NoCan News는 AI가 큐레이션하는 뉴스레터입니다.
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        Powered by Gemini AI • Noise Off, Context On
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  }

  /**
   * 개별 뉴스 아이템 HTML 렌더링
   */
  private renderNewsItem(news: ProcessedNews): string {
    const { original, rewrittenTitle, insight } = news;

    return `
      <div style="margin-bottom: 24px; padding: 16px; background: #fafafa; border-radius: 8px; border-left: 4px solid #4a4e69;">
        <!-- Original Title (Strikethrough) -->
        <p style="font-size: 12px; color: #9ca3af; text-decoration: line-through; margin: 0 0 8px 0;">
          ${original.title}
        </p>

        <!-- Detoxed Title -->
        <h3 style="font-size: 16px; color: #1a1a2e; font-weight: 600; margin: 0 0 12px 0; line-height: 1.4;">
          ${rewrittenTitle || original.title}
        </h3>

        <!-- Source & Date -->
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 12px 0;">
          📰 ${original.source}
        </p>

        ${
          insight
            ? `
        <!-- 3-Line Insight -->
        <div style="background: white; padding: 12px; border-radius: 6px;">
          <p style="font-size: 13px; color: #374151; margin: 0 0 8px 0; line-height: 1.5;">
            <span style="color: #3b82f6; font-weight: 600;">📍 Fact:</span> ${insight.fact}
          </p>
          <p style="font-size: 13px; color: #374151; margin: 0 0 8px 0; line-height: 1.5;">
            <span style="color: #f59e0b; font-weight: 600;">📍 Context:</span> ${insight.context}
          </p>
          <p style="font-size: 13px; color: #374151; margin: 0; line-height: 1.5;">
            <span style="color: #10b981; font-weight: 600;">📍 Implication:</span> ${insight.implication}
          </p>
        </div>
        `
            : ''
        }
      </div>
    `;
  }

  /**
   * 이메일 발송
   */
  async sendNewsletter(to: string[], html: string): Promise<void> {
    if (!this.transporter) {
      const errorMsg =
        'Email transporter not configured. Check GMAIL_USER and GMAIL_PASS environment variables.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const today = new Date().toISOString().split('T')[0];

    this.logger.log(`Attempting to send email to: ${to.join(', ')}`);
    this.logger.log(`Email size: ${(html.length / 1024).toFixed(2)} KB`);

    try {
      const senderEmail = this.configService.get('GMAIL_USER');
      const info = await this.transporter.sendMail({
        from: `"NoCan News" <${senderEmail}>`,
        to: senderEmail,
        bcc: to.join(', '),
        subject: `🔇 NoCan News - ${today} | 오늘의 구조적 맥락`,
        html,
      });

      this.logger.log(`✅ Email sent successfully`);
      this.logger.log(`📧 Message ID: ${info.messageId}`);
      this.logger.log(
        `📬 Accepted recipients: ${info.accepted?.join(', ') || 'N/A'}`,
      );
      if (info.rejected && info.rejected.length > 0) {
        this.logger.warn(`⚠️ Rejected recipients: ${info.rejected.join(', ')}`);
      }
    } catch (error) {
      this.logger.error('Failed to send newsletter email');

      if (error.code === 'EAUTH') {
        this.logger.error(
          'Authentication failed. Check your Gmail App Password.',
        );
        this.logger.error(
          'Create App Password at: https://myaccount.google.com/apppasswords',
        );
      } else if (error.code === 'ESOCKET') {
        this.logger.error(
          'Network connection failed. Check your internet connection.',
        );
      } else if (error.code === 'EENVELOPE') {
        this.logger.error(
          'Invalid email addresses detected. Check NEWSLETTER_RECIPIENTS.',
        );
      }

      this.logger.error(`Error details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate email addresses
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get recipients with validation
   */
  getRecipients(): string[] {
    const recipients = this.configService.get<string>('NEWSLETTER_RECIPIENTS');
    if (!recipients) {
      this.logger.warn('No recipients configured');
      return [];
    }

    const emails = recipients
      .split(',')
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);

    // Validate each email
    const validEmails: string[] = [];
    const invalidEmails: string[] = [];

    for (const email of emails) {
      if (this.validateEmail(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    }

    if (invalidEmails.length > 0) {
      this.logger.warn(
        `⚠️ Invalid email addresses found: ${invalidEmails.join(', ')}`,
      );
    }

    if (validEmails.length > 0) {
      this.logger.log(`✅ Valid recipients: ${validEmails.length}`);
    }

    return validEmails;
  }
}
