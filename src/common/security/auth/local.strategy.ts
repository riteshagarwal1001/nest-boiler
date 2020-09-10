import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthHelperService } from './services/auth.helper.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authHelperService: AuthHelperService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.authHelperService.validateUser(
            username,
            password,
        );
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
