import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
} from '@nestjs/common';
import * as config from 'config';
import { Reflector } from '@nestjs/core';
const jwt = require('jsonwebtoken');
import { PrincipalContext } from '../../../shared/service/principal.context.service';
import { UsersService } from '../../../users/users.service';
import { UserInterface } from '../../../users/interfaces/user.interface';
const serverConfig: {
    securityEnabled: boolean;
} = config.get('server');
const jwtConstants: {
    secret: boolean;
} = config.get('jwtConstants');
const logOutError: {
    error: string;
    code: number;
} = config.get('logOutError');

@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(
        private readonly reflector: Reflector,
        private readonly userService: UsersService,
    ) {}

    removeSecurityKeys(request) {
        if (request && request.body) {
            if (request.body instanceof Array) {
                request.body = request.body.map(element => {
                    if (element && element instanceof Object) {
                        delete element.globalAccessMask;
                        delete element.rolesAccessMask;
                        delete element.usersAccessMask;
                    }
                    return element;
                });
            }
            if (request.body instanceof Object) {
                delete request.body.globalAccessMask;
                delete request.body.rolesAccessMask;
                delete request.body.usersAccessMask;
            }
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        this.removeSecurityKeys(request);
        if (!serverConfig.securityEnabled) {
            return true;
        }
        const isPublic = this.reflector.get<boolean>(
            'isPublic',
            context.getHandler(),
        );
        const allowUsersWithAutomatedPassword = this.reflector.get<boolean>(
            'allowAutomatedPasswordUsers',
            context.getHandler(),
        );
        if (isPublic) {
            return true;
        }
        const user: UserInterface = AuthGuard.getDecodedUser(request);
        if (!user) {
            throw new HttpException(logOutError.error, logOutError.code);
        }
        const dbUser = await this.userService.findOne(user.email);
        if (!dbUser || !dbUser._id) {
            return false;
        }
        if (dbUser.isDeactivated) {
            throw new HttpException(logOutError.error, logOutError.code);
        }
        if (dbUser.hasAutomatedPassword && !allowUsersWithAutomatedPassword) {
            throw new HttpException(logOutError.error, logOutError.code);
        }
        PrincipalContext.User = dbUser;
        return true;
    }

    static getDecodedUser(req) {
        let token = null;
        let decodedUser = null;
        if (
            req.headers.authorization &&
            req.headers.authorization.split(' ')[0] === 'Bearer'
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        } else if (req.cookies && req.cookies.authorization) {
            token = req.cookies.authorization;
        }
        if (!token) {
            return null;
        }
        try {
            decodedUser = jwt.verify(token, jwtConstants.secret);
        } catch (err) {
            return null;
        }
        return decodedUser;
    }
}
