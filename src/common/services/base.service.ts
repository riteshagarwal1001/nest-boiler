import { MongooseModel } from '../../shared/mongo/services/mongoose.model';
import { SortingOrder } from '../../shared/mongo/interfaces/base.interface';
import { BaseDto } from '../../shared/mongo/dto/base.dto';
import * as mongoose from 'mongoose';
import { Logger } from '../../logger/logger';
import { PopulateFieldInfoInterface } from '../../shared/mongo/interfaces/populateFieldsInfo.interface';
import { EntityActionInterface } from '../security/interfaces/entity.action';

export class BaseService {
    private readonly mongoModel: MongooseModel;
    private readonly model;
    private readonly log = Logger.getInstance();
    constructor(mongooseModel: MongooseModel, model: any) {
        this.mongoModel = mongooseModel;
        this.model = model;
    }

    async preBulkUpdate(params: EntityActionInterface[]) {
        return params;
    }

    async preUpdate(param: EntityActionInterface) {
        return param;
    }

    private async generateEntityBulk(dtos: BaseDto[]) {
        const dbEntities = await this.mongoModel.findAll(this.model, false, {
            _id: { $in: dtos.map(x => x._id.toString()) },
        });
        const output: EntityActionInterface[] = [];
        dbEntities.forEach(dbEntityObject => {
            const matchedInputEntity = dtos.find(
                x => x._id.toString() === dbEntityObject._id.toString(),
            );
            output.push({
                dbEntity: dbEntityObject,
                inputEntity: matchedInputEntity,
            });
        });
        return output;
    }

    private async generateEntitySingle(dto: BaseDto) {
        const dbEntitiy = await this.mongoModel.findOne(this.model, {
            _id: dto._id.toString(),
        });
        const output: EntityActionInterface = {
            dbEntity: dbEntitiy,
            inputEntity: dto,
        };
        return output;
    }

    async findAll(
        filters?: {
            [key: string]: string[] | number[] | string | number | {};
            remove?: { [key: string]: string[] | number[] | string | number };
            dateRangeFilter?: {
                from: number | string;
                to: number | string;
                key: string;
            };
        },
        skip?: number,
        limit?: number,
        sortingParam?: string,
        sortingOrder?: SortingOrder,
        populateFieldsInfo?: PopulateFieldInfoInterface[],
        securityDisabled?: boolean,
    ) {
        return this.mongoModel
            .findAll(
                this.model,
                securityDisabled,
                filters,
                skip,
                limit,
                populateFieldsInfo,
                sortingParam,
                sortingOrder,
            )
            .then(res => {
                this.log.log(
                    {
                        method: this.findAll.name,
                        message: `findall success ${JSON.stringify(res)}`,
                    },
                    BaseService.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.findAll.name,
                        message: `findall failed ${JSON.stringify(
                            err,
                            Object.getOwnPropertyNames(err),
                        )}`,
                    },
                    BaseService.name,
                );
                throw err;
            });
    }

    async findOne(
        id: string,
        securityDisabled?: boolean,
        sort?: any,
        populateFieldsInfo?: PopulateFieldInfoInterface[],
    ) {
        return this.mongoModel
            .findOne(
                this.model,
                {
                    _id: id,
                },
                securityDisabled,
                sort,
                populateFieldsInfo,
            )
            .then(res => {
                this.log.log(
                    {
                        method: this.findOne.name,
                        message: `findOne success ${JSON.stringify(res)}`,
                    },
                    BaseService.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.findOne.name,
                        message: `findOne failed ${JSON.stringify(
                            err,
                            Object.getOwnPropertyNames(err),
                        )}`,
                    },
                    BaseService.name,
                );
                throw err;
            });
    }

    async findByField(
        key: string,
        value: any,
        populateFieldsInfo?: PopulateFieldInfoInterface[],
        securityDisabled?: boolean,
    ) {
        return this.findAll(
            { [key]: value },
            null,
            null,
            null,
            null,
            populateFieldsInfo,
            securityDisabled,
        )
            .then(res => {
                this.log.log(
                    {
                        method: this.findByField.name,
                        message: `find by field success ${JSON.stringify(res)}`,
                    },
                    BaseService.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.findByField.name,
                        message: `find by field failed ${JSON.stringify(
                            err,
                            Object.getOwnPropertyNames(err),
                        )}`,
                    },
                    BaseService.name,
                );
                throw err;
            });
    }

    async post(dto: BaseDto, isSecurityDisabled?: boolean) {
        return this.mongoModel
            .post(this.model, dto, isSecurityDisabled)
            .then(res => {
                this.log.log(
                    {
                        method: this.post.name,
                        message: `post success ${JSON.stringify(res)}`,
                    },
                    BaseService.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.post.name,
                        message: `post failed ${JSON.stringify(
                            err,
                            Object.getOwnPropertyNames(err),
                        )}`,
                    },
                    BaseService.name,
                );
                throw err;
            });
    }

    async bulkPost(dtos: BaseDto[], isSecurityDisabled?: boolean) {
        if (!dtos || !dtos.length) {
            return dtos;
        }
        return await this.mongoModel
            .bulkPost(this.model, dtos, isSecurityDisabled)
            .then(res => {
                this.log.log(
                    {
                        method: this.bulkPost.name,
                        message: `bulk post success ${JSON.stringify(res)}`,
                    },
                    BaseService.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.bulkPost.name,
                        message: `bulk post failed ${JSON.stringify(
                            err,
                            Object.getOwnPropertyNames(err),
                        )}`,
                    },
                    BaseService.name,
                );
                throw err;
            });
    }

    async put(
        id: string,
        dto: BaseDto,
        options?: any,
        isSecurityDisabled?: boolean,
        childUpdateParams?: {
            executionContext;
            updateKey: string;
        },
    ) {
        return this.generateEntitySingle(dto).then(wrapper => {
            return this.preUpdate(wrapper).then(finalResponse => {
                return this.mongoModel
                    .put(
                        this.model,
                        { _id: mongoose.Types.ObjectId(id.toString()) },
                        finalResponse.inputEntity,
                        finalResponse.dbEntity,
                        options,
                        isSecurityDisabled,
                        childUpdateParams,
                    )
                    .then(res => {
                        this.log.log(
                            {
                                method: this.put.name,
                                message: `put success ${JSON.stringify(res)}`,
                            },
                            BaseService.name,
                        );
                        return res;
                    })
                    .catch(err => {
                        this.log.error(
                            {
                                method: this.put.name,
                                message: `put failed ${JSON.stringify(
                                    err,
                                    Object.getOwnPropertyNames(err),
                                )}`,
                            },
                            BaseService.name,
                        );
                        throw err;
                    });
            });
        });
    }

    async bulkPut(
        dtos: BaseDto[],
        isSecurityDisabled?: boolean,
        childUpdateParams?: {
            executionContext;
            updateKey: string;
        },
    ) {
        if (!dtos || !dtos.length) {
            return dtos;
        }
        return this.generateEntityBulk(dtos).then(wrapper => {
            return this.preBulkUpdate(wrapper).then(finalResponse => {
                return this.mongoModel
                    .bulkPut(
                        this.model,
                        finalResponse.map(x => x.inputEntity),
                        finalResponse.map(x => x.dbEntity),
                        isSecurityDisabled,
                        childUpdateParams,
                    )
                    .then(res => {
                        this.log.log(
                            {
                                method: this.bulkPut.name,
                                message: `bulkput success ${JSON.stringify(
                                    res,
                                )}`,
                            },
                            BaseService.name,
                        );
                        return res;
                    })
                    .catch(err => {
                        this.log.error(
                            {
                                method: this.bulkPut.name,
                                message: `bulkput failed ${JSON.stringify(
                                    err,
                                )}`,
                            },
                            BaseService.name,
                        );
                        throw err;
                    });
            });
        });
    }

    async findAndUpdate(
        dto: BaseDto,
        key: string,
        value: string,
        isSecurityDisabled?: boolean,
    ) {
        const matchedObjs = await this.findByField(
            key,
            value,
            null,
            isSecurityDisabled,
        );
        if (matchedObjs && matchedObjs.length) {
            dto._id = matchedObjs[0]._id;
            return this.put(
                matchedObjs[0]._id.toString(),
                dto,
                isSecurityDisabled,
            ).catch(err => {
                throw err;
            });
        }
        return null;
    }

    async count(filters?: {
        [key: string]: string[] | number[] | string | number | {};
        remove?: { [key: string]: string[] | number[] | string | number };
        dateRangeFilter?: {
            from: number | string;
            to: number | string;
            key: string;
        };
    }) {
        const docs = await this.mongoModel.count(this.model, filters);
        return docs;
    }

    async findMany(
        ids: string[],
        populateFieldsInfo?: Array<{ pathToPopulate: string }>,
        securityDisabled?: boolean,
    ) {
        return this.findByField(
            '_id',
            { $in: ids.map(id => mongoose.Types.ObjectId(id.toString())) },
            populateFieldsInfo,
            securityDisabled,
        );
    }
}
