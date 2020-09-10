import { BaseInterface } from '../../shared/mongo/interfaces/base.interface';
import { SystemContexts } from '../../common/security/constants/auth.constants';

export interface UserInterface extends BaseInterface {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobile: string;
    roles: string[];
    isDeactivated: boolean;
    exporterBank: string;
    forgotPasswordRequested?: boolean;
    hasAutomatedPassword?: boolean;
    linkedBanksValidate: () => { error: boolean; message: string };
    userPropsValidate: () => { error: boolean; message: string };
    getUserTypeAndRole: () => {
        isExporterBankUser: boolean;
        isFinancingBankUser: boolean;
        isSecurityAgent: boolean;
        role: string;
        linkedBanks: string[];
        isDataMiner: boolean;
    };
    visibilityMask: number;
    financingBank: string;
    securityAgentLinkedFinBanks: string[];
    secAgentBank: string;
    fullSwiftCode: string;
    viewContext: SystemContexts;
    title: string;
    branch: string;
    exporterId: string;
}
