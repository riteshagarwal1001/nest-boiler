import * as mongoose from 'mongoose';

export function extendSchema(definition: any, options?: any) {
    return new mongoose.Schema(
        Object.assign(
            {},
            {
                createdDate: { type: Date, default: Date.now },
                modifiedDate: { type: Date, default: Date.now },
                globalAccessMask: Number,
                rolesAccessMask: Object,
                usersAccessMask: Object,
                createdByName: String,
                modifiedByName: String,
                createdById: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'user',
                },
                modifiedById: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'user',
                },
            },
            definition,
        ),
        options,
    );
}
