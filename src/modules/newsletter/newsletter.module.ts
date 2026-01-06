import { Module } from '@nestjs/common';
import { DevModeConfig } from '../../common/config/dev-mode.config';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';
import { ReportModule } from '../report/report.module';
import { RssModule } from '../rss/rss.module';
import { ScraperModule } from '../scraper/scraper.module';
import { NewsletterService } from './newsletter.service';

@Module({
  imports: [RssModule, AiModule, EmailModule, ScraperModule, ReportModule],
  providers: [DevModeConfig, NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
