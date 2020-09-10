import { Injectable } from '@nestjs/common';
import { LcCreationDto } from '../../lc/dto/lc.dto';

@Injectable()
export class ContrabandService {
    public setDetails(lcDtos: LcCreationDto[]) {
        lcDtos.forEach(lc => {
            lc.contrabandDetails = {
                isLegal: true,
                redFlaggedItems: [],
                message: '',
            };
        });
        return Promise.resolve(lcDtos);
    }
}
