import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import * as config from 'config';
import { Roles } from './roles/role.conf';
import { PrincipalContext } from '../../../shared/service/principal.context.service';
const serverConfig: {
    securityEnabled: boolean;
} = config.get('server');
@Injectable()
export class ACLGuard implements CanActivate {
    public constructor(private readonly reflector: Reflector) {}
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        if (!serverConfig.securityEnabled) {
            return true;
        }
        const classLevelRoles = this.reflector.get<number[]>(
            'roles',
            context.getClass(),
        );
        const methodLevelRoles = this.reflector.get<number[]>(
            'roles',
            context.getHandler(),
        );
        if (
            (!classLevelRoles || !classLevelRoles.length) &&
            (!methodLevelRoles || !methodLevelRoles.length)
        ) {
            return false;
        }
        const user = PrincipalContext.User;
        if (!user || !user.roles) {
            return false;
        }
        const rolesEnumsOfUser = user.roles.map(role => Roles[role]);
        let isAuthorized = false;
        rolesEnumsOfUser.forEach(element => {
            if (classLevelRoles && classLevelRoles.includes(element)) {
                isAuthorized = true;
            }
            if (methodLevelRoles && methodLevelRoles.includes(element)) {
                isAuthorized = true;
            }
        });
        return isAuthorized;
    }
}
