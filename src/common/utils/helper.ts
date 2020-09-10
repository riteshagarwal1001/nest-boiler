export function roundAmount(num) {
    if (num || num === 0) {
        return Math.round(num * 100) / 100;
    }
    return num;
}

export const trimSpacesForAllStringFields = (anyDto: {
    [key: string]: any;
}) => {
    Object.keys(anyDto).forEach(key => {
        if (typeof anyDto[key] === 'string') {
            anyDto[key] = anyDto[key].trim();
        }
    });
};
