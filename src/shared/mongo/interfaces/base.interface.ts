import * as mongoose from 'mongoose';

export interface BaseInterface extends Document {
    createdDate: Date;
    modifiedDate: Date;
    _id: mongoose.Schema.ObjectId;
    createdByName: string;
    modifiedByName: string;
    createdById: string;
    modifiedById: string;
    globalAccessMask?: number;
    rolesAccessMask?: { [key: string]: string };
    usersAccessMask?: { [key: string]: string };
    setRoleAccessMaskWithoutCascade: (roleMask: any) => any;
    setUsersAccessMaskWithoutCascade: (userMask: any) => any;
}

export enum SortingOrder {
    asc = 'asc',
    desc = 'desc',
}
