import { Get, Query, Controller, Param, Body, Post, Put } from '@nestjs/common';
import { Auth } from '../decorators/auth';
import { Roles } from '../security/auth/roles/role.conf';
import { SortingOrder } from '../../shared/mongo/interfaces/base.interface';
import { BaseService } from '../services/base.service';
import { BaseDto } from '../../shared/mongo/dto/base.dto';
import Validation from '../utils/validate';
import { Logger } from '../../logger/logger';

@Controller()
@Auth([Roles.ROLE_ADMIN])
export class BaseController {
    protected readonly service: BaseService;
    protected readonly modelType: any;
    private readonly log = Logger.getInstance();
    constructor(service: BaseService, modelType: any) {
        this.service = service;
        this.modelType = modelType;
    }

    @Get()
    async findAll(
        @Query('filters')
        filters?: {
            [key: string]: string[] | number[] | string | number | {};
            remove?: { [key: string]: string[] | number[] | string | number };
            dateRangeFilter?: {
                from: number | string;
                to: number | string;
                key: string;
            };
        },
        @Query('skip') skip?: number,
        @Query('limit') limit?: number,
        @Query('sortingParam') sortingParam?: string,
        @Query('sortingOrder') sortingOrder?: SortingOrder,
    ) {
        limit = limit > 100 ? 100 : limit;
        if (skip) {
            skip = +skip;
        }
        if (limit) {
            limit = +limit;
        }
        return this.service
            .findAll(
                filters &&
                    Object.keys(filters).length &&
                    JSON.parse(filters as any),
                skip,
                limit,
                sortingParam,
                sortingOrder,
            )
            .then(res => {
                this.log.log(
                    {
                        method: this.findAll.name,
                        message: `find all success ${JSON.stringify(res)}`,
                    },
                    BaseController.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.findAll.name,
                        message: `find all failed ${JSON.stringify(
                            err,
                            Object.getOwnPropertyNames(err),
                        )}`,
                    },
                    BaseController.name,
                );
                throw err;
            });
    }

    @Get('count')
    async count(@Query('filters')
    filters?: {
        [key: string]: string[] | number[] | string | number | {};
        remove?: { [key: string]: string[] | number[] | string | number };
        dateRangeFilter?: {
            from: number | string;
            to: number | string;
            key: string;
        };
    }) {
        return await this.service.count(filters && JSON.parse(filters as any));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.service
            .findOne(id)
            .then(res => {
                this.log.log(
                    {
                        method: this.findOne.name,
                        message: `find one success ${JSON.stringify(res)}`,
                    },
                    BaseController.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.findOne.name,
                        message: `find one failed ${JSON.stringify(
                            err,
                            Object.getOwnPropertyNames(err),
                        )}`,
                    },
                    BaseController.name,
                );
                throw err;
            });
    }

    @Post()
    async post(@Body() dto: BaseDto | BaseDto[], noValidationNeeded?: boolean) {
        if (!noValidationNeeded) {
            await Validation.validate(this.modelType, dto);
        }
        if (dto instanceof Array) {
            return this.service
                .bulkPost(dto)
                .then(res => {
                    this.log.log(
                        {
                            method: this.post.name,
                            message: `bulk post success ${JSON.stringify(res)}`,
                        },
                        BaseController.name,
                    );
                    return res;
                })
                .catch(err => {
                    this.log.error(
                        {
                            method: this.post.name,
                            message: `bulk post failed ${JSON.stringify(
                                err,
                                Object.getOwnPropertyNames(err),
                            )}`,
                        },
                        BaseController.name,
                    );
                    throw err;
                });
        }
        return this.service
            .post(dto)
            .then(res => {
                this.log.log(
                    {
                        method: this.post.name,
                        message: `post success ${JSON.stringify(res)}`,
                    },
                    BaseController.name,
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
                    BaseController.name,
                );
                throw err;
            });
    }

    @Put()
    async put(@Body() dto: BaseDto | BaseDto[], noValidationNeeded?: boolean) {
        if (!noValidationNeeded) {
            await Validation.validate(this.modelType, dto);
        }
        if (dto instanceof Array) {
            return this.service
                .bulkPut(dto)
                .then(res => {
                    this.log.log(
                        {
                            method: this.put.name,
                            message: `bulk put success ${JSON.stringify(res)}`,
                        },
                        BaseController.name,
                    );
                    return res;
                })
                .catch(err => {
                    this.log.error(
                        {
                            method: this.put.name,
                            message: `bulk put failed ${JSON.stringify(
                                err,
                                Object.getOwnPropertyNames(err),
                            )}`,
                        },
                        BaseController.name,
                    );
                    throw err;
                });
        }
        return this.service
            .put(dto._id.toString(), dto)
            .then(res => {
                this.log.log(
                    {
                        method: this.put.name,
                        message: `put success ${JSON.stringify(res)}`,
                    },
                    BaseController.name,
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
                    BaseController.name,
                );
                throw err;
            });
    }
}
