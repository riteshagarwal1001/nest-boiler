import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollingModule } from '../polling/polling.module';
import { Logger } from '../logger/logger';
import { LoggerMiddleware } from '../logger/logger.middleware';
import { WebhookModule } from '../webhook/webhook.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as config from 'config';
import { TestModule } from '../test/test.module';
import { AuthModule } from '../common/security/auth/auth.module';
import { AuthController } from '../common/security/auth/auth.controller';
import { NetworkModule } from '../common/network/network.module';
const env = config.get('env');
const mongoConfig: { url: string } = config.get('mongodb');

@Module({
    imports: [
        // TypeOrmModule.forRoot(typeOrmConfig),
        MongooseModule.forRoot(mongoConfig.url),
        PollingModule,
        WebhookModule,
        TestModule,
        AuthModule,
        NetworkModule,
    ],
    controllers: [AppController, AuthController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
        consumer.apply(LoggerMiddleware).forRoutes('/');
    }

    private readonly logger = Logger.getInstance();

    constructor() {
        // this.logger.log({ label: 'db config', method: 'constructor', message: typeOrmConfig }, AppModule.name);
        this.logger.log(
            { label: 'env', method: 'constructor', message: env },
            AppModule.name,
        );
    }
}
