import { ApiModelProperty } from '@nestjs/swagger';

import { IsDefined, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @IsEmail()
    @IsDefined()
    @ApiModelProperty()
    email: string;
}
