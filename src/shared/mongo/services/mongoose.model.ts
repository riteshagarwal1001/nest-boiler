import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BaseDto } from '../dto/base.dto';
import * as mongoose from 'mongoose';
import { PopulateFieldInfoInterface } from '../interfaces/populateFieldsInfo.interface';
import { SortingOrder } from '../interfaces/base.interface';
import { AccessControlService } from '../../../common/security/services/access.control.service';
import { Logger } from '../../../logger/logger';
import { isArray } from 'util';

@Injectable()
export class MongooseModel {
    private readonly log = Logger.getInstance();
    async put(
        executionContext,
        condition,
        data,
        dbEntity,
        options?: any,
        disableSecurity?: boolean,
        childUpdateParams?: {
            executionContext;
            updateKey: string;
        },
    ) {
        const newSchema = { new: true };
        let finalOptions = {};
        if (options) {
            finalOptions = Object.assign({}, options, newSchema);
        } else {
            finalOptions = Object.assign({}, newSchema);
        }
        if (!disableSecurity) {
            const canSave = await AccessControlService.canSaveEntity(dbEntity);
            if (!canSave) {
                throw new HttpException(
                    'User Does not have access to update the entity',
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
        try {
            const finalResult = await executionContext.findOneAndUpdate(
                condition,
                BaseDto.updateAudit(data),
                finalOptions,
            );

            if (childUpdateParams && childUpdateParams.executionContext) {
                await this.updateChild(
                    childUpdateParams.executionContext,
                    childUpdateParams.updateKey,
                    [finalResult],
                );
                return finalResult;
            }
            this.log.log(
                {
                    method: this.findOne.name,
                    message: `put success ${finalResult &&
                        JSON.stringify(finalResult)}`,
                },
                MongooseModel.name,
            );
            return finalResult;
        } catch (err) {
            this.log.error(
                {
                    method: this.put.name,
                    message: `put failed ${err &&
                        JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
                },
                MongooseModel.name,
            );
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }

    private async updateChild(
        executionContext,
        updateKey: string,
        allDocs: BaseDto[],
    ) {
        const updateParams: Array<{ findCondition; updateDocument }> = [];
        allDocs.forEach(doc => {
            updateParams.push({
                findCondition: { [updateKey + '._id']: doc._id },
                updateDocument: doc,
            });
        });
        const bulk = executionContext.collection.initializeUnorderedBulkOp();
        updateParams.forEach(param => {
            const updateQuery = {
                $set: { [updateKey]: param.updateDocument },
            };
            bulk.find(param.findCondition).update(updateQuery, { multi: true });
        });
        return bulk
            .execute()
            .then(res => {
                this.log.log(
                    {
                        method: this.updateChild.name,
                        message: `updateChild success ${res &&
                            JSON.stringify(res)}`,
                    },
                    MongooseModel.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.updateChild.name,
                        message: `updateChild failed ${err &&
                            JSON.stringify(
                                err,
                                Object.getOwnPropertyNames(err),
                            )}`,
                    },
                    MongooseModel.name,
                );
                throw new HttpException(err, HttpStatus.BAD_REQUEST);
            });
    }

    async bulkPut(
        executionContext,
        data,
        dbEntities: any[],
        disableSecurity?: boolean,
        childUpdateParams?: {
            executionContext;
            updateKey: string;
        },
        options?: any,
    ) {
        const bulk = executionContext.collection.initializeUnorderedBulkOp();
        const ids = [];
        if (!disableSecurity && dbEntities && dbEntities.length) {
            const canSave = await AccessControlService.canSaveEntities(
                dbEntities,
            );
            if (!canSave) {
                throw new HttpException(
                    'User Does not have access to update the entities',
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
        data.forEach(model => {
            const id = mongoose.Types.ObjectId(model._id.toString());
            ids.push(id);
            delete model._id;
            BaseDto.updateAudit(model);
            const updateModel = new executionContext(model, null, true);
            bulk.find({
                _id: id,
            }).update({ $set: updateModel });
        });
        try {
            await bulk.execute(null, options);
        } catch (err) {
            this.log.error(
                {
                    method: this.bulkPut.name,
                    message: `bulkPut failed ${err &&
                        JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
                },
                MongooseModel.name,
            );
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
        try {
            const finalResult = await this.find(executionContext, {
                _id: { $in: ids },
            });
            if (childUpdateParams && childUpdateParams.executionContext) {
                await this.updateChild(
                    childUpdateParams.executionContext,
                    childUpdateParams.updateKey,
                    finalResult,
                );
                return finalResult;
            }
            return finalResult;
        } catch (err) {
            this.log.error(
                {
                    method: this.bulkPut.name,
                    message: `bulkPut failed ${err &&
                        JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
                },
                MongooseModel.name,
            );
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }

    async post(executionContext, data, disableSecurity?: boolean) {
        if (!disableSecurity) {
            const canSave = await AccessControlService.canSaveEntity(data);
            if (!canSave) {
                throw new HttpException(
                    'User Does not have access to create the entities',
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
        return executionContext
            .create({
                ...data,
            })
            .then(res => {
                this.log.log(
                    {
                        method: this.post.name,
                        message: `post success ${res && JSON.stringify(res)}`,
                    },
                    MongooseModel.name,
                );
                return JSON.parse(JSON.stringify(res));
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.post.name,
                        message: `post failed ${err &&
                            JSON.stringify(
                                err,
                                Object.getOwnPropertyNames(err),
                            )}`,
                    },
                    MongooseModel.name,
                );
                throw new HttpException(err, HttpStatus.BAD_REQUEST);
            });
    }

    async bulkPost(
        executionContext,
        data: any[],
        disableSecurity?: boolean,
        options?: any,
    ) {
        if (!disableSecurity) {
            const canSave = await AccessControlService.canSaveEntities(data);
            if (!canSave) {
                throw new HttpException(
                    'User Does not have access to create the entities',
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
        return executionContext
            .insertMany(data, options)
            .then(res => {
                this.log.log(
                    {
                        method: this.bulkPost.name,
                        message: `bulkpost success ${res &&
                            JSON.stringify(res)}`,
                    },
                    MongooseModel.name,
                );
                return JSON.parse(JSON.stringify(res));
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.bulkPost.name,
                        message: `bulkpost failed ${err &&
                            JSON.stringify(
                                err,
                                Object.getOwnPropertyNames(err),
                            )}`,
                    },
                    MongooseModel.name,
                );
                throw new HttpException(err, HttpStatus.BAD_REQUEST);
            });
    }

    updateFilterQueryRemove(filterQuery) {
        if (filterQuery && filterQuery.remove) {
            const remove = filterQuery.remove;
            delete filterQuery.remove;
            Object.keys(remove).forEach(key => {
                filterQuery[key] = {
                    $nin: remove[key],
                };
            });
        }
        return filterQuery;
    }

    updateFilterQueryArray(filterQuery) {
        Object.keys(filterQuery).forEach(key => {
            if (filterQuery[key] && isArray(filterQuery[key])) {
                try {
                    filterQuery[key] = {
                        $in: filterQuery[key].map(x => {
                            if (
                                x.match(/^[0-9a-fA-F]{24}$/) &&
                                mongoose.Types.ObjectId.isValid(x)
                            ) {
                                return mongoose.Types.ObjectId(x);
                            } else {
                                return x;
                            }
                        }),
                    };
                } catch (err) {
                    // do nothing
                }
            }
        });
        return filterQuery;
    }

    updateFilterQueryDateRange(filterQuery) {
        if (filterQuery && filterQuery.dateRangeFilter) {
            const dateRangeFilter: {
                from: number | string;
                to: number | string;
                key: string;
            } = filterQuery.dateRangeFilter;
            delete filterQuery.dateRangeFilter;
            filterQuery[dateRangeFilter.key] = {};
            if (
                dateRangeFilter.from >= 0 &&
                typeof dateRangeFilter.from !== 'string'
            ) {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() + dateRangeFilter.from);
                /* tslint:disable */
                filterQuery[dateRangeFilter.key]['$gte'] = startDate;
                /* tslint:enable */
            }
            if (
                dateRangeFilter.from &&
                typeof dateRangeFilter.from === 'string'
            ) {
                /* tslint:disable */
                filterQuery[dateRangeFilter.key]['$gte'] = new Date(
                    dateRangeFilter.from,
                );
                /* tslint:enable */
            }
            if (
                dateRangeFilter.to >= 0 &&
                typeof dateRangeFilter.to !== 'string'
            ) {
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + dateRangeFilter.to);
                /* tslint:disable */
                filterQuery[dateRangeFilter.key]['$lte'] = endDate;
                /* tslint:enable */
            }
            if (dateRangeFilter.to && typeof dateRangeFilter.to === 'string') {
                /* tslint:disable */
                filterQuery[dateRangeFilter.key]['$lte'] = new Date(
                    dateRangeFilter.to,
                );
                /* tslint:enable */
            }
        }
        return filterQuery;
    }

    count(
        executionContext,
        filters?: {
            [key: string]: string[] | number[] | string | number | {};
            remove?: { [key: string]: string[] | number[] | string | number };
            dateRangeFilter?: {
                from: number | string;
                to: number | string;
                key: string;
            };
        },
    ) {
        let filterQuery = filters || {};
        filterQuery = this.updateFilterQueryRemove(filterQuery);
        filterQuery = this.updateFilterQueryArray(filterQuery);
        filterQuery = this.updateFilterQueryDateRange(filterQuery);
        return executionContext.countDocuments(filterQuery);
    }

    populateFields(populateFieldsInfo, result) {
        populateFieldsInfo.forEach(pathInfo => {
            const populationInfoObj = {
                path: pathInfo.pathToPopulate,
                select: pathInfo.fieldsInpopulatedPath,
            };
            result.populate(populationInfoObj);
        });
        return result;
    }

    async findAll(
        executionContext,
        disableSecurity: boolean,
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
        populateFieldsInfo?: PopulateFieldInfoInterface[],
        sortingParam?: string,
        sortingOrder?: SortingOrder,
    ) {
        const options = {} as any;
        let filterQuery = filters || {};
        filterQuery = this.updateFilterQueryRemove(filterQuery);
        filterQuery = this.updateFilterQueryArray(filterQuery);
        filterQuery = this.updateFilterQueryDateRange(filterQuery);
        if (sortingParam) {
            options.sort = { [sortingParam]: sortingOrder || SortingOrder.asc };
        }
        if (skip >= 0 && limit >= 0) {
            options.skip = skip;
            options.limit = limit;
        }
        let result = executionContext.find(filterQuery, [], options);
        if (populateFieldsInfo) {
            result = this.populateFields(populateFieldsInfo, result);
        }
        try {
            const entities = await result.lean();
            if (disableSecurity) {
                return entities;
            }
            return AccessControlService.canReadEntities(entities);
        } catch (err) {
            this.log.error(
                {
                    method: this.findAll.name,
                    message: `findall failed ${err &&
                        JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
                },
                MongooseModel.name,
            );
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }

    async findOne(
        executionContext,
        condition,
        securityDisabled?: boolean,
        sort?: any,
        populateFieldsInfo?: PopulateFieldInfoInterface[],
    ) {
        try {
            let result = executionContext.findOne(condition, null, sort);
            if (populateFieldsInfo) {
                result = this.populateFields(populateFieldsInfo, result);
            }
            const entity = await result.lean();
            if (securityDisabled) {
                return entity;
            }
            return AccessControlService.canReadEntity(entity);
        } catch (err) {
            this.log.error(
                {
                    method: this.findOne.name,
                    message: `findone failed ${err &&
                        JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
                },
                MongooseModel.name,
            );
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }

    async find(executionContext, query, securityDisabled?: boolean) {
        try {
            const entities = await executionContext.find(query).lean();
            if (securityDisabled) {
                return entities;
            }
            return AccessControlService.canReadEntities(entities);
        } catch (err) {
            this.log.error(
                {
                    method: this.find.name,
                    message: `find failed ${err &&
                        JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
                },
                MongooseModel.name,
            );
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }

    aggregate(executionContext, query) {
        return executionContext
            .aggregate(query)
            .then(res => {
                this.log.log(
                    {
                        method: this.aggregate.name,
                        message: `aggregate success ${res &&
                            JSON.stringify(res)}`,
                    },
                    MongooseModel.name,
                );
                return res;
            })
            .catch(err => {
                this.log.error(
                    {
                        method: this.aggregate.name,
                        message: `aggregate failed ${err &&
                            JSON.stringify(
                                err,
                                Object.getOwnPropertyNames(err),
                            )}`,
                    },
                    MongooseModel.name,
                );
                throw new HttpException(err, HttpStatus.BAD_REQUEST);
            });
    }

    async delete(executionContext, id: string) {
        try {
            const dbEntity = await this.findOne(executionContext, { _id: id });
            if (AccessControlService.canDeleteEntity(dbEntity)) {
                return executionContext.deleteOne({ _id: id });
            }
            return null;
        } catch (err) {
            this.log.error(
                {
                    method: this.delete.name,
                    message: `delete failed ${err &&
                        JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
                },
                MongooseModel.name,
            );
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }

    async bulkDelete(executionContext, ids: string[]) {
        try {
            const dbEntities = await this.find(executionContext, {
                _id: { $in: ids },
            });
            if (!dbEntities || dbEntities.length !== ids.length) {
                return null;
            }
            if (AccessControlService.canDeleteEntities(dbEntities)) {
                return executionContext.deleteMany({
                    _id: { $in: ids },
                });
            }
            return null;
        } catch (err) {
            this.log.error(
                {
                    method: this.bulkDelete.name,
                    message: `bulk delete failed ${err &&
                        JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
                },
                MongooseModel.name,
            );
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }
}
