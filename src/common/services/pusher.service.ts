import { Injectable } from '@nestjs/common';
import * as config from 'config';
const pusherConfig: {
    appId: string;
    key: string;
    secret: string;
    cluster: string;
    encrypted: boolean;
} = config.get('pusher');
const Pusher = require('pusher');

const pusher = new Pusher({
    appId: pusherConfig.appId,
    key: pusherConfig.key,
    secret: pusherConfig.secret,
    cluster: pusherConfig.cluster,
    encrypted: pusherConfig.encrypted,
});

@Injectable()
export class PusherService {
    public async trigger(
        channelName: string,
        eventName: string,
        jsonData: { [key: string]: any },
    ) {
        pusher.trigger(channelName, eventName, jsonData);
    }
}
