import { Injectable } from '@nestjs/common';
const sgMail = require('@sendgrid/mail');
import * as config from 'config';

interface Attchment {
    content: string;
    filename: string;
    type: string;
    disposition: string;
}

interface EmailServiceInputs {
    to: string[];
    from: string;
    subject: string;
    text?: string;
    html: string;
    attachments?: Attchment[];
}

@Injectable()
export class EmailService {
    public send(emailTemplate: EmailServiceInputs, attachment?: Attchment[]) {
        sgMail.setApiKey(config.get('SENDGRID_API_KEY'));
        if (attachment) {
            emailTemplate.attachments = attachment;
        }
        return sgMail
            .send(emailTemplate)
            .then(() => {
                return true;
            })
            .catch(error => {
                return true;
            });
    }
}
