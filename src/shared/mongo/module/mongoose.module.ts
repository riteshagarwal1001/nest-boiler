import { Module } from '@nestjs/common';
import { MongooseModel } from '../services/mongoose.model';
@Module({
    imports: [],
    controllers: [],
    providers: [MongooseModel],
    exports: [MongooseModel],
})
export class MongooseModuleHelper {}
