const sgMail = require('@sendgrid/mail')

export class Sendgrid {
    // private static sendgrid:any = MailService

    public static async init (sendgridKey:string) {
        await sgMail.setApiKey(sendgridKey)
    }

    public static async send (msg: any) {
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }
}
