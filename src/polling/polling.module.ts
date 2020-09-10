import { Module } from '@nestjs/common';
import { PollingService } from './polling.service';

@Module({
    imports: [],
    providers: [PollingService],
})
export class PollingModule {}
