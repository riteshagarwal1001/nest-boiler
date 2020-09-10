import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from '../common/security/auth/roles/role.conf';
import { Auth } from '../common/decorators/auth';
import { Public } from '../common/decorators/public';
@Controller()
export class AppController {
    // private readonly logger = Logger.getInstance();

    constructor(private readonly appService: AppService) {}

    @Get('/')
    getAppNameRoot(): string {
        return this.appService.getAppName();
    }

    @Public()
    @Get('/healthCheck')
    getAppName(): string {
        return this.appService.getAppName();
    }
}
