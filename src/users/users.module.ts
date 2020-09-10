import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { MongooseModuleHelper } from '../shared/mongo/module/mongoose.module';
import { EmailService } from '../common/services/email.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
        MongooseModuleHelper,
    ],
    providers: [UsersService, EmailService],
    exports: [UsersService],
})
export class UsersModule {}
