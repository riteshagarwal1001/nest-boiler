import { Injectable } from '@nestjs/common';
import * as config from 'config';
import { Logger } from '../logger/logger';
const serverConfig: { pollingEnabled: boolean } = config.get('server');

@Injectable()
export class PollingService {
    private readonly logger = Logger.getInstance();

    constructor() {
        if (!serverConfig.pollingEnabled) {
            return;
        }
        this.logger.log(
            { label: `Polling Started`, method: `constructor`, message: null },
            PollingService.name,
        );
        // this.acceptanceMaturityPoll().start();
    }

    // acceptanceMaturityPoll() {
    //     const pollTime = POLLTIME.ACCEPTANCE_MATURED_MARK;
    //     return new CronJob(pollTime, () => {
    //         const d = domain.create();
    //         d.run(async () => {
    //             const user = {};
    //             PrincipalContext.User = user;
    //             const currentUser = PrincipalContext.User;
    //             currentUser.viewContext = SystemContexts.SKIP_SECURITY;
    //             return this.acceptanceAllocationService
    //                 .markAssetsMatured()
    //                 .then((res) => {
    //                     this.logger.log(
    //                         {
    //                             label: `Polling Started for markAssetsMatured`,
    //                             method: this.acceptanceMaturityPoll.name,
    //                             message: 'polling started to markAssetsMatured',
    //                         },
    //                         PollingService.name,
    //                     );
    //                     return res;
    //                 })
    //                 .catch((err) => {
    //                     this.logger.error(
    //                         {
    //                             label: `Polling failed for markAssetsMatured`,
    //                             method: this.acceptanceMaturityPoll.name,
    //                             message: 'polling failed to markAssetsMatured',
    //                         },
    //                         PollingService.name,
    //                     );
    //                     throw err;
    //                 });
    //         });
    //     });
    // }
}
