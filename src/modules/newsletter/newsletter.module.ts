import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';
import { RssModule } from '../rss/rss.module';
import { ScraperModule } from '../scraper/scraper.module';
import { NewsletterService } from './newsletter.service';

@Module({
  imports: [RssModule, AiModule, EmailModule, ScraperModule],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
