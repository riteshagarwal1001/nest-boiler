import * as config from 'config';

export default class Templates {
    static getForgotPasswordTemplate(
        receivers: string[],
        data: { [key: string]: any },
    ) {
        const subject = 'Reset Password';
        const emailBody = `
        <tr>
            <td>
                <p>
        We've received a request to reset your password.<br>If you didn't make the request,
        just ignore this email.<br>Otherwise you can use the following link to reset your password.
                </p>
            </td>
       </tr>
       <tr>
            <td>
                <a href=${data.resetlink} title="Go to reset password page">
                    <strong>Reset Password</strong>
                </a><br>
                <i>This link will expire in an hour.</i>
            </td>
        </tr>`;
        return Templates.generateTemplate(receivers, subject, emailBody);
    }

    static getExternalUserRegistrationTemplate(
        receivers: string[],
        data: { [key: string]: any },
    ) {
        const subject = 'Registration Successful!';
        const emailBody = `
        <tr>
            <td>
                <p>
        You have been sucessfully registered with us.<br>
        Please login using below credentials and change your password.
                </p>
            </td>
       </tr>
       <tr>
            <td>
                Username: ${data.username}<br>
                Password: <i>${data.password}</i>
            </td>
        </tr>`;
        return Templates.generateTemplate(receivers, subject, emailBody);
    }

    static getExporterUserInternalRegistrationTemplate(
        receivers: string[],
        data: { [key: string]: any },
    ) {
        const userhasRegistered = !data.username || !data.password;
        const subject = userhasRegistered
            ? 'Consent Request'
            : 'Registration Successful!';
        const message = userhasRegistered
            ? `Please visit the provided link to provide your consent.`
            : `You have been sucessfully registered with us.<br>
        Please visit the provided link to provide your consent.
        Use following credentials when prompted to login and change your password.`;
        const emailBody = `
        <tr>
            <td>
                <p>${message}</p>
            </td>
       </tr>
       <tr>
            <td>
                <a href=${data.consentFormLink} title="Go to consent form page">
                    <strong>Go to Consent Form Page</strong>
                </a><br>
                ${
                    !userhasRegistered
                        ? ` Username: ${data.username}<br>
                      Password: <i>${data.password}</i>`
                        : ``
                }
            </td>
        </tr>`;
        return Templates.generateTemplate(receivers, subject, emailBody);
    }

    static getPaymentAdviceTemplate(receivers: string[]) {
        const subject = 'Payment Advice';
        const emailBody = `
            <td>
                <p>
                We are attaching Payment Advice PDFs for payment made to you for purchase of assets.
                </p>
            </td>
       </tr>
       <tr>
        `;
        return Templates.generateTemplate(receivers, subject, emailBody);
    }

    private static generateTemplate(
        receivers: string[],
        subject: string,
        emailBody: string,
    ) {
        const sender = config.get('senderEmail');
        return {
            to: receivers,
            from: sender,
            subject,
            html: `
            <body style="margin: 0; padding: 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td>Hello!</td>
                    </tr>
                    ${emailBody}
                    <tr>
                        <td><p>Thanks!<br>Interlinkages Team</p></td>
                    </tr>
                </table>
            </body>`,
        };
    }
}
