// min inclusive, max exclusive
export const LC_EXPIRY_DATE_BOUNDARIES_IN_DAYS = [
    0,
    16,
    31,
    61,
    91,
    121,
    181,
    361,
    365,
];

export const MATURITY_BUCKETS = [
    { id: 0, name: '0-30 days' },
    { id: 31, name: '31-60 days' },
    { id: 61, name: '61-90 days' },
    { id: 91, name: '91 days and above' },
];
