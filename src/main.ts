import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as config from 'config';
import * as bodyParser from 'body-parser';
import { Logger } from './logger/logger';
import { swaggerOptions } from './shared/config/swagger.config';
import { TransformInterceptor } from './common/interceptor';
const domain = require('./shared/service/domain');
const serverConfig: {
    port: number;
    httpEnabled: boolean;
    pollingEnabled: boolean;
} = config.get('server');

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: Logger.getInstance(),
    });
    app.enableCors();
    app.use(domain.middleware('context'));
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new TransformInterceptor());
    const document = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup('/swagger', app, document);
    if (serverConfig.httpEnabled) {
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        const PORT = process.env.PORT || serverConfig.port;
        await app.listen(PORT);
    }
}

bootstrap();
