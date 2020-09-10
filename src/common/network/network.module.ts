import { NetworkService } from './network.service';
import { Module, HttpModule } from '@nestjs/common';

@Module({
    imports: [
        HttpModule.register({
            timeout: 45000,
        }),
    ],
    providers: [NetworkService],
    exports: [NetworkService],
})
export class NetworkModule {}
