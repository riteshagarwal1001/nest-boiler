export enum AccessMask {
    READ = 1,
    WRITE = 2,
    CREATE = 4,
    DELETE = 8,
    PUBLISH = 16,
    UNPUBLISH = 32,
}

export enum VissibilityMask {
    UPLOAD_LC = 1,
    VIEW_LC = 2,
    UPLOAD_ACCEPTANCES = 4,
    VIEW_ACCEPTANCES = 8,
    PREDICITIVE_POOL = 16,
    USERS = 32,
    UPLOAD_IMPORTER_BANKS = 64,
    ADMIN_ACCEPTANCE_TABLE_STATUS_CONFIG = 128,
    CORE_ROUTES = 256,
    PURCHASE_ORDER = 512,
    DASHBOARD = 1024,
    SECURITY_AGENT = 2048,
    KYC_DOCS_TAB = 4096,
    KYC_EDIT = 8192,
    FINANCING_BANK_USER = 16384,
    FACILITY_DOCS_TAB = 32768,
    FACILITY_EDIT = 65536,
    DATA_MINER = 131072,
    CONSENT_CREATE = 262144,
    CONSENT_VIEW = 524288,
}

export enum VissibilityMaskAccess {
    P_ALL = VissibilityMask.VIEW_LC +
        VissibilityMask.UPLOAD_LC +
        VissibilityMask.VIEW_ACCEPTANCES +
        VissibilityMask.UPLOAD_ACCEPTANCES +
        VissibilityMask.PREDICITIVE_POOL +
        VissibilityMask.USERS +
        VissibilityMask.UPLOAD_IMPORTER_BANKS +
        VissibilityMask.ADMIN_ACCEPTANCE_TABLE_STATUS_CONFIG +
        VissibilityMask.CORE_ROUTES +
        VissibilityMask.PURCHASE_ORDER +
        VissibilityMask.DASHBOARD +
        VissibilityMask.SECURITY_AGENT +
        VissibilityMask.FINANCING_BANK_USER +
        VissibilityMask.KYC_DOCS_TAB +
        VissibilityMask.KYC_EDIT +
        VissibilityMask.FACILITY_DOCS_TAB +
        VissibilityMask.FACILITY_EDIT +
        VissibilityMask.DATA_MINER +
        VissibilityMask.CONSENT_CREATE +
        VissibilityMask.CONSENT_VIEW,
    P_EXPORTER_BANK = VissibilityMask.VIEW_ACCEPTANCES +
        VissibilityMask.DASHBOARD +
        VissibilityMask.KYC_DOCS_TAB +
        VissibilityMask.KYC_EDIT +
        VissibilityMask.FACILITY_DOCS_TAB +
        VissibilityMask.CONSENT_VIEW,
    P_SEC_AGENT = VissibilityMask.PURCHASE_ORDER +
        VissibilityMask.SECURITY_AGENT,
    P_FINANCING_BANK = VissibilityMask.FINANCING_BANK_USER +
        VissibilityMask.KYC_DOCS_TAB +
        VissibilityMask.CONSENT_VIEW,
    P_DATA_MINER = VissibilityMask.DATA_MINER,
    P_EXPORTER_USER = VissibilityMask.CONSENT_CREATE +
        VissibilityMask.CONSENT_VIEW,
}

export enum PermissionGroupAccess {
    P_AUTHOR = AccessMask.READ +
        AccessMask.WRITE +
        AccessMask.PUBLISH +
        AccessMask.DELETE +
        AccessMask.CREATE +
        AccessMask.UNPUBLISH,
    P_READ = AccessMask.READ,
    P_READWRITE = AccessMask.READ + AccessMask.WRITE,
    P_READWRITEDEL = AccessMask.READ + AccessMask.WRITE + AccessMask.DELETE,
}
