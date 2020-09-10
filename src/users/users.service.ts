import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { MongooseModel } from '../shared/mongo/services/mongoose.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from './interfaces/user.interface';

const bcrypt = require('bcrypt');
import * as config from 'config';
import { PopulateFieldInfoInterface } from '../shared/mongo/interfaces/populateFieldsInfo.interface';
import AutoGeneratePassword from '../common/security/auth/password/auto.generate';
import Templates from '../common/utils/email.templates';
import { EmailService } from '../common/services/email.service';
const jwtConstants: {
    saltRounds: boolean;
} = config.get('jwtConstants');

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('user')
        private readonly userModel: Model<UserInterface>,
        private readonly mongooseModel: MongooseModel,
        private readonly emailService: EmailService,
    ) {}

    async findOne(email: string): Promise<UserInterface | undefined> {
        return this.mongooseModel.findOne(this.userModel, { email }, true);
    }

    async createUser(user: UserDto, roles: string[]) {
        return this.generateHash(user.password).then(async hash => {
            this.setParams(user, hash, roles);
            const createdUser = await this.mongooseModel.post(
                this.userModel,
                user,
                true,
            );
            return createdUser;
        });
    }

    async updateUser(
        user: UserDto | { _id: string; [key: string]: string | boolean },
        isDeactivate?: boolean,
    ) {
        if (isDeactivate === true) {
            return this.mongooseModel.put(
                this.userModel,
                { _id: user._id },
                { _id: user._id, isDeactivated: isDeactivate },
                null,
                null,
                true,
            );
        }
        if (isDeactivate === false) {
            return this.mongooseModel.put(
                this.userModel,
                { _id: user._id },
                { _id: user._id, isDeactivated: isDeactivate },
                null,
                null,
                true,
            );
        }
        return this.mongooseModel.put(
            this.userModel,
            { _id: user._id },
            { ...user },
            null,
            null,
            true,
        );
    }

    async unsetUserFields(user: UserDto, fieldsToUnset: string[]) {
        const unsetQuery = {} as any;
        fieldsToUnset.forEach(item => (unsetQuery[item] = 1));
        return this.mongooseModel.put(
            this.userModel,
            { _id: user._id },
            { $unset: unsetQuery },
            null,
            null,
            true,
        );
    }

    setParams(user: UserDto, hash: any, roles: string[]) {
        user.password = hash;
        user.email = user.email.trim().toLowerCase();
        user.roles = roles;
    }

    async findAll(
        filters?: {
            [key: string]: string[] | number[] | string | any;
        },
        populateFieldsInfo?: PopulateFieldInfoInterface[],
    ) {
        if (filters) {
            return this.mongooseModel.findAll(
                this.userModel,
                true,
                filters,
                null,
                null,
                populateFieldsInfo,
            );
        }
        return this.mongooseModel.findAll(
            this.userModel,
            true,
            null,
            null,
            null,
            populateFieldsInfo,
        );
    }

    async generateHash(password) {
        return bcrypt.hash(password, jwtConstants.saltRounds);
    }

    async createExporterUserInternally(user: UserDto, consentFormLink: string) {
        const dbUser = await this.findOne(user.email);
        let automatedPassword;
        let newUser = null;
        // if (!dbUser) {
        //     const role = Roles[Roles.ROLE_EXPORTER];
        //     const errorsProps = user.userPropsValidate(role);
        //     if (errorsProps.error) {
        //         throw new HttpException(
        //             errorsProps.message,
        //             HttpStatus.BAD_REQUEST,
        //         );
        //     }
        //     automatedPassword = AutoGeneratePassword.password();
        //     user.password = automatedPassword;
        //     user.hasAutomatedPassword = true;
        //     newUser = await this.createUser(user, [role]);
        // }
        if (dbUser && dbUser.hasAutomatedPassword) {
            automatedPassword = AutoGeneratePassword.password();
            dbUser.password = await this.generateHash(automatedPassword);
            newUser = await this.updateUser(dbUser);
        }
        if (dbUser && !dbUser.hasAutomatedPassword) {
            newUser = dbUser;
        }
        let emailData = { consentFormLink } as any;
        if (automatedPassword) {
            emailData = {
                username: newUser.email,
                password: automatedPassword,
                consentFormLink,
            };
        }
        const emailTemplate = Templates.getExporterUserInternalRegistrationTemplate(
            [newUser.email],
            emailData,
        );
        this.emailService.send(emailTemplate);
        return newUser;
    }
}
