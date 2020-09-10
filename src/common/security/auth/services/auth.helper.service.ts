import { Injectable } from '@nestjs/common';
import { UsersService } from '../../../../users/users.service';
import { UserInterface } from '../../../../users/interfaces/user.interface';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthHelperService {
    constructor(private readonly usersService: UsersService) {}

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(
            email.trim().toLowerCase(),
        );
        if (!user || !user.password) {
            return null;
        }
        return bcrypt.compare(pass, user.password).then((response: any) => {
            if (!response) {
                return null;
            }
            const { password, ...result } = user;
            return result;
        });
    }

    parseUpdateUserObject(userObject: UserInterface) {
        const user = {
            _id: userObject._id,
            mobile: userObject.mobile,
            title: userObject.title,
        };
        return user;
    }
}
