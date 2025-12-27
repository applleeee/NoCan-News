import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RssModule } from './modules/rss/rss.module';
import { AiModule } from './modules/ai/ai.module';
import { EmailModule } from './modules/email/email.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { ScraperModule } from './modules/scraper/scraper.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RssModule,
    AiModule,
    EmailModule,
    NewsletterModule,
    ScraperModule,
  ],
})
export class AppModule {}
