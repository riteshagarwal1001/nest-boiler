export const isAssetExporterCountryAllowed = (
    blacklistedExporterCountries: string[],
    lcExporterCountry: string,
) => {
    let assetExporterCountryAllowed = true;
    blacklistedExporterCountries.forEach(item => {
        if (item.toLowerCase() === lcExporterCountry.toLowerCase()) {
            assetExporterCountryAllowed = false;
        }
    });
    return assetExporterCountryAllowed;
};

export const isExportedGoodsAllowed = (
    blacklistedGoods: string[],
    lcItemDescription,
) => {
    let exportedGoodsAllowed = true;
    blacklistedGoods.forEach(item => {
        if (lcItemDescription.toLowerCase().includes(item.toLowerCase())) {
            exportedGoodsAllowed = false;
        }
    });
    return exportedGoodsAllowed;
};

export const unique = (value, index, self) => {
    return self.indexOf(value) === index;
};

export const roundTo2ToNumber = value => {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    if (!isNaN(value) && typeof value === 'number') {
        return Math.round(value * 100) / 100;
    }
    return value;
};

/**
 * converts a value to a number
 * @param value
 */
export const toNumber = value => (isNaN(+value) ? 0 : +value);

export const rupeeToPaise = (r: number) => Math.round(r * 100);

export const paiseToRupee = (p: number): number =>
    toNumber(p) ? toNumber(p) / 100 : 0;
