import { AccessMask, PermissionGroupAccess } from '../../../../security.config';

export class AccessControlMaskUtil {
    /**
     * check read permission mask
     * @param mask
     */
    static hasReadPermission(mask: number): boolean {
        return (mask & AccessMask.READ) === AccessMask.READ;
    }

    /**
     * check write permission mask
     * @param mask
     */
    static hasWritePermission(mask: number): boolean {
        return (mask & AccessMask.WRITE) === AccessMask.WRITE;
    }

    /**
     * check create permission mask
     * @param mask
     */
    static hasCreatePermission(mask: number): boolean {
        return (mask & AccessMask.CREATE) === AccessMask.CREATE;
    }

    /**
     * check delete permission mask
     * @param mask
     */
    static hasDeletePermission(mask: number): boolean {
        return (mask & AccessMask.DELETE) === AccessMask.DELETE;
    }

    /**
     * check publish permission mask
     * @param mask
     */
    static hasPublishPermission(mask: number): boolean {
        return (mask & AccessMask.PUBLISH) === AccessMask.PUBLISH;
    }

    /**
     * check un-publish permission mask
     * @param mask
     */
    static hasUnPublishPermission(mask: number): boolean {
        return (mask & AccessMask.UNPUBLISH) === AccessMask.UNPUBLISH;
    }

    /**
     * check role wise Read permission mask
     * @param roleAccessMask
     * @param role
     */
    static hasRoleReadPermission(roleAccessMask: any, role: string[]) {
        return this.hasReadPermission(
            this.getRoleAccessMask(roleAccessMask, role),
        );
    }

    /**
     * check role wise write permission mask
     * @param roleAccessMask
     * @param role
     */
    static hasRoleWritePermission(roleAccessMask: any, role: string[]) {
        return this.hasWritePermission(
            this.getRoleAccessMask(roleAccessMask, role),
        );
    }

    /**
     * check role wise Create permission mask
     * @param roleAccessMask
     * @param role
     */
    static hasRoleCreatePermission(roleAccessMask: string, role: string[]) {
        return this.hasCreatePermission(
            this.getRoleAccessMask(roleAccessMask, role),
        );
    }

    /**
     * check role wise Delete permission mask
     * @param roleAccessMask
     * @param role
     */
    static hasRoleDeletePermission(roleAccessMask: any, role: string[]) {
        return this.hasDeletePermission(
            this.getRoleAccessMask(roleAccessMask, role),
        );
    }

    /**
     * check role wise Publish permission mask
     * @param roleAccessMask
     * @param userId
     */
    static hasRolePublishPermission(roleAccessMask: string, role: string[]) {
        return this.hasPublishPermission(
            this.getRoleAccessMask(roleAccessMask, role),
        );
    }

    /**
     * check role wise UnPublish permission mask
     * @param roleAccessMask
     * @param userId
     */
    static hasRoleUnPublishPermission(roleAccessMask: string, role: string[]) {
        return this.hasUnPublishPermission(
            this.getRoleAccessMask(roleAccessMask, role),
        );
    }

    /**
     * check user wise read permission mask
     * @param userAccessMask
     * @param userId
     */
    static hasUserReadPermission(userAccessMask: any, userId: string) {
        return this.hasReadPermission(
            this.getUserAccessMask(userAccessMask, userId),
        );
    }

    /**
     * check user wise write permission mask
     * @param userAccessMask
     * @param userId
     */
    static hasUserWritePermission(userAccessMask: any, userId: string) {
        return this.hasWritePermission(
            this.getUserAccessMask(userAccessMask, userId),
        );
    }

    /**
     * check user wise create permission mask
     * @param userAccessMask
     * @param userId
     */
    static hasUserCreatePermission(userAccessMask: string, userId: string) {
        return this.hasCreatePermission(
            this.getUserAccessMask(userAccessMask, userId),
        );
    }

    /**
     * check user wise delete permission mask
     * @param userAccessMask
     * @param userId
     */
    static hasUserDeletePermission(userAccessMask: any, userId: string) {
        return this.hasDeletePermission(
            this.getUserAccessMask(userAccessMask, userId),
        );
    }

    /**
     * check user wise publish permission mask
     * @param userAccessMask
     * @param userId
     */
    static hasUserPublishPermission(userAccessMask: string, userId: string) {
        return this.hasPublishPermission(
            this.getUserAccessMask(userAccessMask, userId),
        );
    }

    /**
     * check  user wise un-publish permission mask
     * @param userAccessMask
     * @param userId
     */
    static hasUserUnPublishPermission(userAccessMask: string, userId: string) {
        return this.hasUnPublishPermission(
            this.getUserAccessMask(userAccessMask, userId),
        );
    }

    /**
     * extract mask from userAccessMask json
     * @param userAccessMaskJson
     * @param userId
     */
    private static getUserAccessMask(
        userAccessMaskJson: string,
        userId: string,
    ) {
        let mask: number = 0;

        if (!userAccessMaskJson) {
            return mask;
        }

        Object.keys(userAccessMaskJson).forEach(key => {
            if (userId === key) {
                mask = +PermissionGroupAccess[userAccessMaskJson[key]];
            }
        });

        return mask;
    }

    /**
     * extract mask from roleAccessMask json
     * @param roleAccessMaskJson
     * @param role
     */
    private static getRoleAccessMask(
        roleAccessMaskJson: string,
        role: string[],
    ) {
        let mask: number = 0;

        if (!roleAccessMaskJson) {
            return mask;
        }
        if (!role || !role.length) {
            return mask;
        }

        Object.keys(roleAccessMaskJson).forEach(key => {
            if (role.indexOf(key) >= 0) {
                const tempMask: any =
                    PermissionGroupAccess[roleAccessMaskJson[key]];
                if ((mask & tempMask) === tempMask) {
                    return;
                } // means say P_READ already present in the mask, so no need to add twice.
                mask = +PermissionGroupAccess[roleAccessMaskJson[key]];
            }
        });

        return mask;
    }
}
