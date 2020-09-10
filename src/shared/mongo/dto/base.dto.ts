import * as mongoose from 'mongoose';

export class BaseDto {
    createdDate: Date;
    modifiedDate: Date;
    createdByName: string;
    modifiedByName: string;
    createdById: string;
    modifiedById: string;
    globalAccessMask?: number;
    rolesAccessMask?: { [key: string]: string };
    usersAccessMask?: { [key: string]: string };
    /* tslint:disable */
    _id: { type: mongoose.Schema.ObjectId; auto: true } | string;
    /* tslint:enable */
    static updateAudit(object) {
        object.modifiedDate = new Date();
        return object;
    }

    /**
     * set role access mask of own
     * @param roleMask
     */
    setRoleAccessMaskWithoutCascade(roleMask: any) {
        if (!roleMask) {
            return;
        }

        if (!this.rolesAccessMask) {
            this.rolesAccessMask = {};
        }
        Object.keys(roleMask).forEach(userId => {
            this.rolesAccessMask[userId] = roleMask[userId];
        });
    }

    /**
     * set user access mask of own
     * @param userMask
     */
    setUsersAccessMaskWithoutCascade(userMask: any) {
        if (!userMask) {
            return;
        }
        if (!this.usersAccessMask) {
            this.usersAccessMask = {};
        }
        Object.keys(userMask).forEach(userId => {
            this.usersAccessMask[userId] = userMask[userId];
        });
    }
}
