import { extendSchema } from '../../shared/mongo/schema/base.schema';
import * as mongoose from 'mongoose';
export const UserSchema = extendSchema(
    {
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        mobile: String,
        roles: [String],
        isDeactivated: { type: Boolean, default: false },
        exporterBank: { type: mongoose.Schema.Types.ObjectId, ref: 'bank' },
        financingBank: { type: mongoose.Schema.Types.ObjectId, ref: 'bank' },
        securityAgentLinkedFinBanks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'bank',
            },
        ],
        secAgentBank: { type: mongoose.Schema.Types.ObjectId, ref: 'bank' },
        forgotPasswordRequested: Boolean,
        hasAutomatedPassword: Boolean,
        fullSwiftCode: String,
        title: String,
        branch: String,
        exporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expimp',
        },
    },
    { strict: true },
);
