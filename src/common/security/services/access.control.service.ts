import { PrincipalContext } from '../../../shared/service/principal.context.service';
import { UserInterface } from '../../../users/interfaces/user.interface';
import * as config from 'config';
import { BaseDto } from '../../../shared/mongo/dto/base.dto';
import { AccessControlMaskUtil } from '../utils/access.control.mask.util';
import { SystemContexts } from '../constants/auth.constants';
const serverConfig: {
    securityEnabled: boolean;
} = config.get('server');
export class AccessControlService {
    private static checkForReadPermission(
        curUser: UserInterface,
        entity: BaseDto,
    ): boolean {
        if (entity.globalAccessMask) {
            if (
                AccessControlMaskUtil.hasReadPermission(entity.globalAccessMask)
            ) {
                return true;
            }
        }

        if (entity.rolesAccessMask) {
            if (
                AccessControlMaskUtil.hasRoleReadPermission(
                    entity.rolesAccessMask,
                    curUser.roles,
                )
            ) {
                return true;
            }
        }

        if (entity.usersAccessMask) {
            if (
                AccessControlMaskUtil.hasUserReadPermission(
                    entity.usersAccessMask,
                    curUser._id.toString(),
                )
            ) {
                return true;
            }
        }

        return false;
    }

    private static checkReadEntity(entity: BaseDto): boolean {
        if (!serverConfig.securityEnabled) {
            return true;
        }
        if (!entity) {
            return false;
        }

        const currentUser: UserInterface = PrincipalContext.User;

        if (!currentUser) {
            return false;
        }

        if (AccessControlService.checkForReadPermission(currentUser, entity)) {
            // AccessControlService.setWhatAccessOnEntity(currentUser, entity);
            return true;
        }

        return false;
    }

    public static canReadEntity(entity: BaseDto): BaseDto {
        if (!serverConfig.securityEnabled) {
            return entity;
        }
        const currentUser: UserInterface = PrincipalContext.User;
        if (
            currentUser &&
            currentUser.viewContext === SystemContexts.SKIP_SECURITY
        ) {
            return entity;
        }
        if (AccessControlService.checkReadEntity(entity)) {
            return entity;
        }
        return null;
    }

    public static canReadEntities(entities: BaseDto[]): any {
        if (!serverConfig.securityEnabled) {
            return entities;
        }
        // const currentUser: UserInterface = PrincipalContext.User;
        const readableEntities = [];
        entities.forEach(entity => {
            const qualifiedEntity = AccessControlService.canReadEntity(entity);
            if (qualifiedEntity) {
                readableEntities.push(qualifiedEntity);
            }
        });
        return readableEntities;
    }

    private static checkWritePermissionForCurrentUser(
        curUser: UserInterface,
        entity: BaseDto,
    ): boolean {
        if (!serverConfig.securityEnabled) {
            return true;
        }

        if (!curUser) {
            return false;
        }
        if (!entity) {
            return false;
        }

        if (entity.globalAccessMask) {
            if (
                AccessControlMaskUtil.hasWritePermission(
                    entity.globalAccessMask,
                )
            ) {
                return true;
            }
        }

        if (entity.rolesAccessMask) {
            if (
                AccessControlMaskUtil.hasRoleWritePermission(
                    entity.rolesAccessMask,
                    curUser.roles,
                )
            ) {
                return true;
            }
        }

        if (entity.usersAccessMask) {
            if (
                AccessControlMaskUtil.hasUserWritePermission(
                    entity.usersAccessMask,
                    curUser._id.toString(),
                )
            ) {
                return true;
            }
        }
        return false;
    }

    public static async canSaveEntity(entity: BaseDto) {
        if (!serverConfig.securityEnabled) {
            return true;
        }
        const currentUser: UserInterface = PrincipalContext.User;
        if (!currentUser) {
            return false;
        }
        if (!entity) {
            return false;
        }

        if (
            currentUser &&
            currentUser.viewContext === SystemContexts.SKIP_SECURITY
        ) {
            return true;
        }

        if (!entity._id) {
            entity.createdById = currentUser._id;
            entity.createdByName =
                currentUser.firstName + ' ' + currentUser.lastName;
            return true;
        }

        if (
            AccessControlService.checkWritePermissionForCurrentUser(
                currentUser,
                entity,
            )
        ) {
            entity.modifiedById = currentUser._id;
            entity.modifiedByName =
                currentUser.firstName + ' ' + currentUser.lastName;
            return true;
        }

        return false;
    }

    public static async canSaveEntities(entities: BaseDto[]) {
        if (!entities || !entities.length) {
            return true;
        }
        if (!serverConfig.securityEnabled) {
            return true;
        }
        let canSaveObj: boolean = true;
        const asynCallsArr = [];
        entities.forEach(entityItem => {
            asynCallsArr.push(AccessControlService.canSaveEntity(entityItem));
        });
        return Promise.all(asynCallsArr).then(succussObj => {
            succussObj.forEach(eachSuccess => {
                if (!eachSuccess) {
                    canSaveObj = false;
                }
            });
            return canSaveObj;
        });
    }

    private static checkForDeletePermission(
        curUser: UserInterface,
        entity: BaseDto,
    ): boolean {
        if (!serverConfig.securityEnabled) {
            return true;
        }

        if (!curUser) {
            return false;
        }
        if (!entity) {
            return false;
        }

        if (entity.globalAccessMask) {
            if (
                AccessControlMaskUtil.hasDeletePermission(
                    entity.globalAccessMask,
                )
            ) {
                return true;
            }
        }

        if (entity.rolesAccessMask) {
            if (
                AccessControlMaskUtil.hasRoleDeletePermission(
                    entity.rolesAccessMask,
                    curUser.roles,
                )
            ) {
                return true;
            }
        }

        if (entity.usersAccessMask) {
            if (
                AccessControlMaskUtil.hasUserDeletePermission(
                    entity.usersAccessMask,
                    curUser._id.toString(),
                )
            ) {
                return true;
            }
        }

        return false;
    }

    static canDeleteEntity(entity: BaseDto) {
        if (!serverConfig.securityEnabled) {
            return true;
        }
        const currentUser: UserInterface = PrincipalContext.User;
        if (
            AccessControlService.checkForDeletePermission(currentUser, entity)
        ) {
            return true;
        }
        return false;
    }

    static canDeleteEntities(entities: BaseDto[]) {
        if (!serverConfig.securityEnabled) {
            return true;
        }
        const currentUser: UserInterface = PrincipalContext.User;
        let canDelete = true;
        entities.forEach(entity => {
            if (
                AccessControlService.checkForDeletePermission(
                    currentUser,
                    entity,
                )
            ) {
                canDelete = false;
            }
        });
        return canDelete;
    }
}
