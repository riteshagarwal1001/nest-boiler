import * as config from 'config';

const env = config.get('env');

export const ENVIRONMENT = env;
