import { UseGuards, SetMetadata } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ACLGuard } from '../security/auth/acl.guard';
import { Roles } from '../security/auth/roles/role.conf';

export function Auth(roles: Roles[]) {
    return applyDecorators(SetMetadata('roles', roles), UseGuards(ACLGuard));
}
