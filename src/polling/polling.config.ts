// 12:05 AM
export const POLLTIME = {
    PURCHASE_ORDER_AMOUNT: `00 05 00 * * *`,
    INTEREST_CALCULATION: `00 55 23 * * *`,
    // ACCEPTANCE_MATURED_MARK: `0 */1 * * * *`, every minute test
    ACCEPTANCE_MATURED_MARK: `00 00 23 * * *`,
    DAILY_BORROWING: `00 30 23 * * *`,
    PAYMENT_ADVICE: `0 */30 * * * *`,
    EXP_BANK_PAYMENT_OVERDUE: `00 00 22 * * *`,
};
