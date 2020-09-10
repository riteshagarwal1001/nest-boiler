import { Injectable } from '@nestjs/common';
import { PrincipalContext } from '../shared/service/principal.context.service';
@Injectable()
export class TestService {
    test() {
        return PrincipalContext.User;
    }
}
