import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../../../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { EmailService } from '../../services/email.service';
import { AuthHelperService } from './services/auth.helper.service';
const jwtConstants: {
    secret: string;
    expiresIn: string;
} = config.get('jwtConstants');
@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: jwtConstants.expiresIn },
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        AuthService,
        LocalStrategy,
        AuthController,
        EmailService,
        AuthHelperService,
    ],
    exports: [AuthService, AuthHelperService],
})
export class AuthModule {}
