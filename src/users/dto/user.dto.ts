import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsDefined, IsEmail } from 'class-validator';
import { BaseDto } from '../../shared/mongo/dto/base.dto';

export class UserDto extends BaseDto {
    @IsEmail()
    @IsDefined()
    @ApiModelProperty()
    email: string;

    @IsString()
    @IsDefined()
    @ApiModelProperty()
    password: string;

    @IsString()
    @IsDefined()
    @ApiModelProperty()
    firstName: string;

    @IsString()
    @IsDefined()
    @ApiModelProperty()
    lastName: string;

    @IsString()
    @IsDefined()
    @ApiModelProperty()
    mobile: string;

    isDeactivated: boolean;

    roles: string[];

    hasAutomatedPassword?: boolean;

    exporterBank: string;

    financingBank: string;

    securityAgentLinkedFinBanks: string[];

    visibilityMask: number;

    fullSwiftCode: string;

    @IsString()
    @IsDefined()
    @ApiModelProperty()
    title: string;

    branch: string;
}
