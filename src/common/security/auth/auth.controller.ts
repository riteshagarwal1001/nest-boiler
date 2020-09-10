import {
    Controller,
    Request,
    Post,
    UseGuards,
    Get,
    Body,
    Query,
    HttpException,
    HttpStatus,
    Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { PrincipalContext } from '../../../shared/service/principal.context.service';
import { Public } from '../../../common/decorators/public';
import { AutomatedUsersAccess } from '../../../common/decorators/automatedUsers';
import { UserDto } from '../../../users/dto/user.dto';
import { Auth } from '../../../common/decorators/auth';
import { Roles } from './roles/role.conf';
import { UserInterface } from '../../../users/interfaces/user.interface';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Get('profile')
    getProfile(@Request() req) {
        return PrincipalContext.User;
    }

    @Public()
    @Post('signup')
    async signup(@Body() user: UserDto) {
        return this.authService.signup(user);
    }

    @Auth([Roles.ROLE_ADMIN])
    @Post('deactivateUser')
    async deactivateUser(@Body() user: UserInterface) {
        return this.authService.deactivateUser(
            user,
            user.isDeactivated ? user.isDeactivated : false,
        );
    }

    @Auth([
        Roles.ROLE_ADMIN,
        Roles.ROLE_EXPORTER_BANK,
        Roles.ROLE_SECURITY_AGENT,
        Roles.ROLE_FINANCING_BANK,
        Roles.ROLE_DATA_MINER,
        Roles.ROLE_EXPORTER,
    ])
    @Get('users')
    async getAllUsers(
        @Query('exporterBankId') exporterBankId: string,
        @Query('finBankId') finBankId: string,
        @Query('secAgentBankId') secAgentBankId: string,
    ) {
        const currentUser: UserDto = PrincipalContext.User;
        let filter;
        if (
            currentUser.roles &&
            currentUser.roles.indexOf(Roles[Roles.ROLE_ADMIN]) < 0
        ) {
            filter = { _id: currentUser._id };
        }
        filter = filter ? filter : {};
        if (finBankId) {
            filter.financingBank = finBankId;
        }
        if (secAgentBankId) {
            filter.secAgentBank = secAgentBankId;
        }
        if (exporterBankId) {
            filter.exporterBank = exporterBankId;
        }
        const allUsers = await this.authService.getAllUsers(filter);
        allUsers.map(user => {
            delete user.password;
        });
        const nonAdminUsers = [];
        allUsers.forEach(user => {
            if (user.roles && user.roles.indexOf(Roles[Roles.ROLE_ADMIN]) < 0) {
                nonAdminUsers.push(user);
            }
        });
        return nonAdminUsers;
    }

    @Public()
    @Post('forgot-password')
    async forgotPassword(@Body() user: ForgotPasswordDto) {
        return this.authService.forgotPassword(user.email);
    }

    @Public()
    @Post('reset-password')
    async resetPassword(
        @Body()
        user: ResetPasswordDto,
    ) {
        return this.authService.resetPassword(
            user.forgotPasswordToken,
            user.newPassword,
        );
    }

    @AutomatedUsersAccess()
    @Auth([
        Roles.ROLE_EXPORTER_BANK,
        Roles.ROLE_FINANCING_BANK,
        Roles.ROLE_SECURITY_AGENT,
        Roles.ROLE_ADMIN,
        Roles.ROLE_DATA_MINER,
        Roles.ROLE_EXPORTER,
    ])
    @Post('change-password')
    async changePassword(@Body()
    user: {
        newPassword: string;
        oldPassword: string;
    }) {
        if (!user.oldPassword || !user.newPassword) {
            throw new HttpException(
                'Both old and new password must be provided',
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.authService.changePassword(
            user.oldPassword,
            user.newPassword,
        );
    }

    @Auth([
        Roles.ROLE_ADMIN,
        Roles.ROLE_EXPORTER_BANK,
        Roles.ROLE_FINANCING_BANK,
        Roles.ROLE_SECURITY_AGENT,
        Roles.ROLE_DATA_MINER,
        Roles.ROLE_EXPORTER,
    ])
    @Put('update-user')
    async updateUser(@Body() user: UserInterface) {
        return this.authService.put(user);
    }
}
