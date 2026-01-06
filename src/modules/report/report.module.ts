import { Module } from '@nestjs/common';
import { SelectionReportService } from './selection-report.service';

@Module({
  providers: [SelectionReportService],
  exports: [SelectionReportService],
})
export class ReportModule {}
