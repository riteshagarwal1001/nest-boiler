import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsDefined } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsDefined()
    @ApiModelProperty()
    newPassword: string;

    @IsString()
    @IsDefined()
    @ApiModelProperty()
    forgotPasswordToken: string;
}
