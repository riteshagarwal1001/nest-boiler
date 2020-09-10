import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../../../../users/users.service';
import { JwtService } from '@nestjs/jwt';
const jwt = require('jsonwebtoken');
import { UserInterface } from '../../../../users/interfaces/user.interface';
import { PrincipalContext } from '../../../../shared/service/principal.context.service';
import { UserDto } from '../../../../users/dto/user.dto';
import { Roles } from '../roles/role.conf';
import * as config from 'config';
import Templates from '../../../utils/email.templates';
import { EmailService } from '../../../services/email.service';
import { VissibilityMaskAccess } from '../../../../../security.config';
import { AuthHelperService } from './auth.helper.service';
const jwtConstants: {
    forgotPasswordTokenSecretKey: string;
    forgotPasswordTokenExpiresIn: number;
} = config.get('jwtConstants');

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly authHelperService: AuthHelperService,
    ) {}

    async login(user: UserInterface) {
        const payload = { email: user.email, _id: user._id };
        let visibilityMask = 0;
        if (user && user.roles) {
            if (user.roles.indexOf(Roles[Roles.ROLE_ADMIN]) >= 0) {
                visibilityMask = VissibilityMaskAccess.P_ALL;
            }
            if (user.roles.indexOf(Roles[Roles.ROLE_EXPORTER_BANK]) >= 0) {
                visibilityMask = VissibilityMaskAccess.P_EXPORTER_BANK;
            }
            if (user.roles.indexOf(Roles[Roles.ROLE_SECURITY_AGENT]) >= 0) {
                visibilityMask = VissibilityMaskAccess.P_SEC_AGENT;
            }
            if (user.roles.indexOf(Roles[Roles.ROLE_FINANCING_BANK]) >= 0) {
                visibilityMask = VissibilityMaskAccess.P_FINANCING_BANK;
            }
            if (user.roles.indexOf(Roles[Roles.ROLE_DATA_MINER]) >= 0) {
                visibilityMask = VissibilityMaskAccess.P_DATA_MINER;
            }
            if (user.roles.indexOf(Roles[Roles.ROLE_EXPORTER]) >= 0) {
                visibilityMask = VissibilityMaskAccess.P_EXPORTER_USER;
            }
        }
        return {
            usertoken: this.jwtService.sign(payload),
            ...user,
            visibilityMask,
        };
    }

    async signup(user: UserDto) {
        return this.usersService.createUser(user, [Roles[Roles.ROLE_ADMIN]]);
    }

    async deactivateUser(user: UserDto, isDeactivate: boolean) {
        return this.usersService.updateUser(user, isDeactivate);
    }

    async getAllUsers(filters?: {
        [key: string]: string[] | number[] | string | any;
    }) {
        return this.usersService.findAll(filters);
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findOne(
            email.trim().toLowerCase(),
        );
        if (!user || user.isDeactivated) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'No user with this email address exists',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const payload = { email: user.email, _id: user._id };
        const forgotPasswordToken = jwt.sign(
            payload,
            jwtConstants.forgotPasswordTokenSecretKey,
            {
                expiresIn: jwtConstants.forgotPasswordTokenExpiresIn,
            },
        );
        user.forgotPasswordRequested = true;
        await this.usersService.updateUser(user as any);
        const resetlink = `${config.get('baseUrl')}/${config.get(
            'resetPasswordRoute',
        )}${forgotPasswordToken}`;
        const emailTemplate = Templates.getForgotPasswordTemplate(
            [user.email],
            {
                resetlink,
            },
        );
        this.emailService.send(emailTemplate);
        return 'You will soon receive an email with reset password link.';
    }

    async resetPassword(token, newPassword) {
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(
                token,
                jwtConstants.forgotPasswordTokenSecretKey,
            );
        } catch (err) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Token is either invalid or expired',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const user = await this.usersService.findOne(decodedUser.email);
        if (!user.forgotPasswordRequested) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error:
                        'You have already reset your password once, if needed please request again using forgot password option',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const newPasswordHash = await this.usersService.generateHash(
            newPassword,
        );
        const updatedUser = await this.usersService.updateUser({
            _id: decodedUser._id,
            password: newPasswordHash,
        });
        await this.usersService.unsetUserFields(updatedUser, [
            'forgotPasswordRequested',
            'hasAutomatedPassword',
        ]);
        const dbUser = await this.usersService.findOne(
            decodedUser.email.trim().toLowerCase(),
        );
        const { password, ...result } = dbUser;
        return result;
    }

    async changePassword(oldPasword: string, newPassword: string) {
        const currentuser = PrincipalContext.User;
        const dbUser = await this.authHelperService.validateUser(
            currentuser.email,
            oldPasword,
        );
        if (!dbUser) {
            throw new HttpException(
                'password does not match',
                HttpStatus.BAD_REQUEST,
            );
        }
        const newPasswordHash = await this.usersService.generateHash(
            newPassword,
        );
        await this.usersService.updateUser({
            _id: currentuser._id,
            password: newPasswordHash,
            hasAutomatedPassword: false,
        });
        const user = await this.usersService.findOne(
            currentuser.email.trim().toLowerCase(),
        );
        const { password, ...result } = user;
        return result;
    }

    async put(userObject: UserInterface) {
        const currentUser: UserDto = PrincipalContext.User;
        if (!userObject._id) {
            throw new HttpException(
                'No valid id present for the input user object',
                HttpStatus.BAD_REQUEST,
            );
        }
        if (
            userObject._id !== currentUser._id.toString() &&
            currentUser.roles.indexOf(Roles[Roles.ROLE_ADMIN]) < 0
        ) {
            throw new HttpException(
                'User does not have rights to update the user object',
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.usersService.updateUser(
            this.authHelperService.parseUpdateUserObject(userObject),
        );
    }
}
