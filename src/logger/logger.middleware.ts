import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from './logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = Logger.getInstance();

    use(req: Request, res: Response, next: () => void) {
        const data = {
            params: req.params,
            body: req.body,
        };
        this.logger.log(
            { label: req.path, method: req.method, message: data },
            LoggerMiddleware.name,
        );
        next();
    }
}
