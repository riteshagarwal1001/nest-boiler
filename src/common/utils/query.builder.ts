import { Types } from 'mongoose';
import { LC_EXPIRY_DATE_BOUNDARIES_IN_DAYS } from './constants/query.constants';
import { PARTIAL_SHIPMENT_STATUS } from '../../acceptance/constants/acceptance.constants';
import { TRANSACTION_TYPE } from '../../transaction/transaction.constants';
import {
    INTEREST_TYPES,
    LOAN_STATUS_TYPES,
} from '../../interestLedger/intLedger.constants';
import { TXN_LEDGER_TYPES } from '../../transactionLedger/txnLedger.constants';

export class QueryBuilderService {
    public static predictivePool(queryParams: {
        receiverBank?: string;
        groupBy?: string;
        bucketBy?: string;
    }) {
        let query = [];
        let matchQuery = { expiryDate: { $gt: new Date() } } as any;
        if (queryParams.receiverBank) {
            matchQuery = {
                $and: [
                    { expiryDate: { $gt: new Date() } },
                    {
                        receiverBank: {
                            $eq: Types.ObjectId(queryParams.receiverBank),
                        },
                    },
                ],
            };
        }
        const match = {
            $match: matchQuery,
        };
        const addSumFields = {
            $addFields: {
                totalLcAmountInDollars: {
                    $multiply: ['$totalAmount', 1],
                },
                totalAcceptancesAmountInDollars: {
                    $multiply: ['$amountOfAcceptances', 1],
                },
            },
        };
        const addPredictivePoolField = {
            $addFields: {
                predictivePoolAmount: {
                    $cond: {
                        if: { $gt: ['$totalAcceptancesAmountInDollars', 0] },
                        then: {
                            $cond: {
                                if: {
                                    $eq: [
                                        { $toUpper: '$partialShipment' },
                                        PARTIAL_SHIPMENT_STATUS.allowed,
                                    ],
                                },
                                then: {
                                    $subtract: [
                                        '$totalLcAmountInDollars',
                                        '$totalAcceptancesAmountInDollars',
                                    ],
                                },
                                else: 0,
                            },
                        },
                        else: '$totalLcAmountInDollars',
                    },
                },
            },
        };

        const groupBy = queryParams.groupBy ? `$${queryParams.groupBy}` : null;
        const group = {
            $group: {
                _id: groupBy,
                totalPredictivePoolAmount: { $sum: '$predictivePoolAmount' },
            },
        };

        let bucketStage = null;
        if (queryParams.bucketBy && queryParams.bucketBy === 'expiryDate') {
            const boundaries = LC_EXPIRY_DATE_BOUNDARIES_IN_DAYS.map(limit => {
                return { $add: [new Date(), limit * 24 * 60 * 60000] };
            });
            const others = boundaries[boundaries.length - 1];
            bucketStage = {
                $bucket: {
                    groupBy: '$expiryDate',
                    boundaries,
                    default: others,
                    output: {
                        totalPredictivePoolAmount: {
                            $sum: '$predictivePoolAmount',
                        },
                    },
                },
            };
        }
        query = [match, addSumFields, addPredictivePoolField];
        if (bucketStage) {
            query.push(bucketStage);
        } else {
            query.push(group);
        }
        return query;
    }

    public static allocatedAssetsAmount(queryParams: {
        borrowingBank: string;
        appliedInsurance: string;
        currentAcceptanceId: string;
    }) {
        let query = [];
        let matchQuery = {};
        if (queryParams.borrowingBank) {
            matchQuery = {
                borrowingBank: {
                    $eq: Types.ObjectId(queryParams.borrowingBank),
                },
            };
        }
        if (queryParams.appliedInsurance) {
            matchQuery = {
                appliedInsurance: {
                    $eq: Types.ObjectId(queryParams.appliedInsurance),
                },
            };
        }
        const match = {
            $match: {
                $and: [
                    {
                        _id: {
                            $ne: Types.ObjectId(
                                queryParams.currentAcceptanceId,
                            ),
                        },
                    },
                    matchQuery,
                ],
            },
        };
        const lookup = {
            $lookup: {
                from: 'currencies',
                localField: 'currencyConversion',
                foreignField: '_id',
                as: 'currencyConversion',
            },
        };
        const unwind = {
            $unwind: '$currencyConversion',
        };
        const addField = {
            $addFields: {
                dollarAmount: {
                    $multiply: [
                        '$totalAmount',
                        '$currencyConversion.conversion',
                    ],
                },
            },
        };
        const group = {
            $group: {
                _id: '$senderBank',
                totalAmount: { $sum: '$dollarAmount' },
            },
        };
        query = [match, lookup, unwind, addField, group];
        return query;
    }

    public static amountPaidOrBorrowed(queryParams: {
        type: TRANSACTION_TYPE;
        groupBy: string;
        dateFilter: Date;
        status: number;
    }) {
        let query = [];
        const match = {
            $match: {
                $and: [
                    {
                        type: {
                            $eq: queryParams.type,
                        },
                    },
                    {
                        status: {
                            $eq: queryParams.status,
                        },
                    },
                    { modifiedDate: { $lte: queryParams.dateFilter } },
                ],
            },
        };
        const group = {
            $group: {
                _id: `$${queryParams.groupBy}`,
                totalAmount: { $sum: '$amount' },
            },
        };
        query = [match, group];
        return query;
    }

    public static balanceAmount(queryParams: {
        accountId: string | string[];
        type?: TXN_LEDGER_TYPES | TXN_LEDGER_TYPES[];
        createdDateFilter?: any;
    }) {
        let query = [];
        const match = {
            $match: {
                accountId:
                    queryParams.accountId instanceof Array
                        ? {
                              $in: queryParams.accountId.map(id =>
                                  Types.ObjectId(id),
                              ),
                          }
                        : Types.ObjectId(queryParams.accountId),
            },
        } as any;
        if (queryParams.type) {
            match.$match.type =
                queryParams.type instanceof Array
                    ? { $in: queryParams.type }
                    : queryParams.type;
        }
        if (queryParams.createdDateFilter) {
            match.$match.createdDate = { $lte: queryParams.createdDateFilter };
        }
        const group = {
            $group: {
                _id: '$accountId',
                totalCredit: { $sum: '$credit' },
                totalDebit: { $sum: '$debit' },
            },
        };
        const addFields = {
            $addFields: {
                balance: { $subtract: ['$totalCredit', '$totalDebit'] },
            },
        };
        query = [match, group, addFields];
        return query;
    }

    public static balanceInterestAmount(queryParams: {
        financeBankIds?: string[];
        insuranceId?: string[];
        interInterestAccId: string[];
    }) {
        let query = [];
        const intIntAccId = {
            $in: queryParams.interInterestAccId.map(id =>
                Types.ObjectId(id.toString()),
            ),
        };

        let matchQuery;
        let intCalcType;
        let intPaymentType;
        let groupBy;
        if (queryParams.financeBankIds) {
            matchQuery = {
                financingBank: {
                    $in: queryParams.financeBankIds.map(id =>
                        Types.ObjectId(id.toString()),
                    ),
                },
            };
            intCalcType = INTEREST_TYPES.interestCalculation;
            intPaymentType = INTEREST_TYPES.interestPayment;
            groupBy = '$financingBank';
        }
        if (queryParams.insuranceId) {
            matchQuery = {
                insurance: {
                    $in: queryParams.insuranceId.map(id =>
                        Types.ObjectId(id.toString()),
                    ),
                },
            };
            intCalcType = INTEREST_TYPES.insurancePremiumCalc;
            intPaymentType = INTEREST_TYPES.insurancePremiumPayment;
            groupBy = '$insurance';
        }
        const match = {
            $match: {
                $and: [
                    matchQuery,
                    {
                        $or: [
                            { type: intCalcType },
                            {
                                $and: [
                                    { type: intPaymentType },
                                    { accountId: intIntAccId },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
        const group = {
            $group: {
                _id: groupBy,
                totalCredit: { $sum: '$credit' },
                totalDebit: { $sum: '$debit' },
            },
        };
        const addFields = {
            $addFields: {
                interestOwed: { $subtract: ['$totalCredit', '$totalDebit'] },
            },
        };
        query = [match, group, addFields];
        return query;
    }

    public static interestAmountAllTime(queryParams: {
        financeBankIds: string[];
        financeBankField: string;
        entryType: INTEREST_TYPES;
        acceptanceIds?: string[];
        loanStatus?: LOAN_STATUS_TYPES[];
        filterAndGroupByAssets?: boolean;
    }) {
        const {
            financeBankIds,
            financeBankField,
            entryType,
            acceptanceIds,
            filterAndGroupByAssets,
            loanStatus,
        } = queryParams;
        let query = [];
        const match = { $match: { type: entryType } } as any;
        if (!filterAndGroupByAssets) {
            match.$match[financeBankField] = {
                $in: financeBankIds.map(id => Types.ObjectId(id.toString())),
            };
        }
        if (loanStatus) {
            match.$match.loanStatus = {
                $in: loanStatus,
            };
        }
        if (Array.isArray(acceptanceIds)) {
            match.$match.acceptanceId = {
                $in: acceptanceIds.map(id => Types.ObjectId(id.toString())),
            };
        }
        const group = {
            $group: {
                _id: filterAndGroupByAssets
                    ? '$acceptanceId'
                    : `$${financeBankField}`,
                totalCredit: { $sum: '$credit' },
                totalDebit: { $sum: '$debit' },
            },
        };
        const addFields = {
            $addFields: {
                allTime: { $subtract: ['$totalCredit', '$totalDebit'] },
            },
        };
        query = [match, group, addFields];
        return query;
    }

    public static profitProfile(
        accountIds: string[],
        acceptanceIds?: string[],
        filterAndGroupByAssets?: boolean,
    ) {
        let query = [];
        const match = {
            $match: {
                accountId: {
                    $in: accountIds.map(id => Types.ObjectId(id)),
                },
                type: {
                    $in: [
                        TXN_LEDGER_TYPES.preBookedRevenue,
                        TXN_LEDGER_TYPES.assetsMaturityRevenueReceived,
                        TXN_LEDGER_TYPES.finBankFundingCharges,
                        TXN_LEDGER_TYPES.payToExpBankCharges,
                        TXN_LEDGER_TYPES.maturityReceiveCharges,
                        TXN_LEDGER_TYPES.interestPaidCharges,
                        TXN_LEDGER_TYPES.finBankPaybackCharges,
                        TXN_LEDGER_TYPES.profitDrawn,
                    ],
                },
            },
        } as any;

        if (filterAndGroupByAssets && Array.isArray(acceptanceIds)) {
            match.$match.acceptanceId = {
                $in: acceptanceIds.map(id => Types.ObjectId(id)),
            };
        }

        const group = {
            $group: {
                _id: filterAndGroupByAssets ? '$acceptanceId' : '$accountId',
                totalCredit: { $sum: '$credit' },
                totalDebit: { $sum: '$debit' },
            },
        };
        const addFields = {
            $addFields: {
                balance: { $subtract: ['$totalCredit', '$totalDebit'] },
            },
        };
        const facet = {
            $facet: {
                revenue: [
                    {
                        $match: {
                            type: { $in: [TXN_LEDGER_TYPES.preBookedRevenue] },
                        },
                    },
                    group,
                    addFields,
                ],
                bulkCharges: [
                    {
                        $match: {
                            type: {
                                $in: [
                                    TXN_LEDGER_TYPES.interestPaidCharges,
                                    TXN_LEDGER_TYPES.finBankPaybackCharges,
                                ],
                            },
                        },
                    },
                    group,
                    addFields,
                ],
                runningProfit: [
                    {
                        $match: {
                            type: {
                                $in: [
                                    TXN_LEDGER_TYPES.preBookedRevenue,
                                    TXN_LEDGER_TYPES.assetsMaturityRevenueReceived,
                                    TXN_LEDGER_TYPES.finBankFundingCharges,
                                    TXN_LEDGER_TYPES.payToExpBankCharges,
                                    TXN_LEDGER_TYPES.maturityReceiveCharges,
                                ],
                            },
                        },
                    },
                    group,
                    addFields,
                ],
                drawableRevenue: [
                    {
                        $match: {
                            type: {
                                $in: [
                                    TXN_LEDGER_TYPES.assetsMaturityRevenueReceived,
                                    TXN_LEDGER_TYPES.profitDrawn,
                                ],
                            },
                        },
                    },
                    group,
                    addFields,
                ],
                assetCharges: [
                    {
                        $match: {
                            type: {
                                $in: [
                                    TXN_LEDGER_TYPES.finBankFundingCharges,
                                    TXN_LEDGER_TYPES.payToExpBankCharges,
                                    TXN_LEDGER_TYPES.maturityReceiveCharges,
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$acceptanceId',
                            totalCredit: { $sum: '$debit' }, // all charges are debit from il acc
                            totalDebit: { $sum: '$credit' }, // ideally it will be 0
                        },
                    },
                    addFields,
                ],
                drawableProfitAssets: [
                    {
                        $match: {
                            type: {
                                $in: [
                                    TXN_LEDGER_TYPES.assetsMaturityRevenueReceived,
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$accountId',
                            assets: {
                                $addToSet: '$acceptanceId',
                            },
                        },
                    },
                ],
            },
        };
        query = [match, facet];
        return query;
    }
}
