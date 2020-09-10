import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as config from 'config';
import TransportStream = require('winston-transport');

// tslint:disable-next-line: no-var-requires
const S3StreamLogger = require('s3-streamlogger').S3StreamLogger;
const { combine, timestamp, json } = winston.format;
export interface LogMessage {
    label?: string;
    method: string;
    message: any;
}

const loggerConfig: winston.LoggerOptions = {
    format: combine(timestamp(), json()),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
};

export class Logger implements LoggerService {
    private static instance: Logger = null;
    private logger: any = null;
    private constructor() {
        const logConfig = config.get('logging');

        if (logConfig.s3LoggingEnabled) {
            const s3LoggingConfig = config.get('s3LoggingConfig');
            const awsCreds = config.get('aws');

            const s3LoggingStream = new S3StreamLogger({
                ...s3LoggingConfig,
                access_key_id: awsCreds.accessKeyId,
                secret_access_key: awsCreds.secretAccessKey,
            });

            (loggerConfig.transports as TransportStream[]).push(
                new winston.transports.Stream({
                    stream: s3LoggingStream,
                }),
            );
        }
        this.logger = winston.createLogger(loggerConfig);
    }

    public static getInstance(): Logger {
        if (!this.instance) {
            this.instance = new Logger();
        }
        return this.instance;
    }

    log(message: LogMessage, context?: string) {
        this.logger.log('info', message, { context });
    }
    error(message: LogMessage, trace?: string, context?: string) {
        this.logger.error(message, { context });
    }
    warn(message: LogMessage, context?: string) {
        this.logger.warn(message, { context });
    }
    debug?(message: LogMessage, context?: string) {
        this.logger.debug(message, { context });
    }
    verbose?(message: LogMessage, context?: string) {
        this.logger.verbose(message, { context });
    }
}
