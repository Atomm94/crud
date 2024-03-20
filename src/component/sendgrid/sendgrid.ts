import { config } from '../../config'
import fs from 'fs'
import { join } from 'path'
import * as _ from 'lodash'

const parentDir = join(__dirname, '.')

const sgMail = require('@sendgrid/mail')
export class Sendgrid {
    // private static sendgrid:any = MailService
    static from = config.sendgrid.fromEmail
    static mainDomain: string = JSON.parse(config.cors.origin)[0]
    static template_logo = `${process.env.BASE_API}/Logo/template_logo.png`

    public static async init (sendgridKey: string) {
        await sgMail.setApiKey(sendgridKey)
    }

    public static async send (msg: any) {
        // const mail = {
        //     to: `${item.email}`,
        //     from: 'g.israelyan@studio-one.am',
        //     subject: 'You have been invited to Unimacs',
        //     text: 'has invited you',
        //     html: `<h2>Unimacs company has invited you to make a registration. Please click link bellow ${this.mainDomain}/registration/${item.token}</h2>`
        // }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    public static async sendInvite (toEmail: string, token: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,

            subject: 'Welcome to AllDoors Onlne.',
            text: 'has invited you',
            html: this.newMail({
                title: 'Welcome to AllDoors.',
                text: 'Your company has been invited to register an account. Please follow the link and fill in the company details. Thank you.',
                link: `${this.mainDomain}/registration/${token}`,
                button_text: 'Create new company'
            })// `<h2>Unimacs company has invited you to make a registration. Please click link bellow ${this.mainDomain}/registration/${item.token}</h2>`
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    public static async sendSignUp (toEmail: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'Welcome to AllDoors Onlne',
            // text: 'Hello!',
            html: this.newTextMail({
                headingText: 'Thank you for registering with AllDoors Onlne.',
                mainText: 'Please tell us a little about yourself by writing to support@lumiring.com, and we will offer you the best possible product package and activate your account ;) Alternatively, you can contact your representative to speed up the process.',
                otherText: 'We are excited to hear from you soon.'
            })
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    public static async InformSuper (toEmail: string, account: any, company: any, account_id: number) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'Account activation request',
            // text: 'Hello!',
            html: this.newSuperTextMail({
                first_name: account.first_name,
                last_name: account.last_name,
                email: account.email,
                phone_number: account.phone_1,
                message: company.message,
                company_name: company.company_name,
                account_id
            })
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    public static async sendPartitionInvite (toEmail: string, token: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'Welcome to AllDoors Onlne.',
            text: 'has invited you',
            html: this.newMail({
                title: 'Welcome to AllDoors Onlne.',
                text: 'Your company has been invited to register an account. Please follow the link and fill in the company details. Thank you.',
                link: `${this.mainDomain}/registrationofPartition/${token}`,
                button_text: 'Create new Partition'
            })// `<h2>Unimacs company has invited you to make a registration. Please click link bellow ${this.mainDomain}/registration/${item.token}</h2>`
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    public static async sendNewPass (toEmail: string, token: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'Welcome to AllDoors Onlne.',
            text: 'has invited you',
            html: this.newMail({
                title: 'Welcome to AllDoors Onlne.',
                text: 'Your company has been successfully registered. To finalize Your Account, please follow the link and set password you\'ll use to sign in to your account. Thank you.',
                link: `${this.mainDomain}/newpassword/${token}`,
                button_text: 'Set Password'
            })// `<h2>Unimacs company has invited you to make a registration. Please click link bellow ${this.mainDomain}/registration/${item.token}</h2>`
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    public static async SetPass (toEmail: string, token: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'Welcome to AllDoors Onlne.',
            text: 'has invited you',
            html: this.newMail({
                title: 'Welcome to AllDoors Onlne.',
                text: ' To register Your Account, please follow the link. Set password you\'ll use to sign in to your account. Thank you.',
                link: `${this.mainDomain}/newUserPassword/${token}`,
                button_text: 'Set password'
            })
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    public static async recoveryPassword (toEmail: string, token: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'Set a New Password',
            text: 'There was recently a request to change the password for your account.If you requested this change, set a new password here:',
            html: this.newMail({
                text: 'There was recently a request to change the password for your account. If you requested this change, set a new password here:',
                link: `${this.mainDomain}/recoveryPassword/${token}`,
                button_text: 'Set a New Password',
                end_text: 'If you did not make this request, you can ignore this email and your password will remain the same.'
            })
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    public static async updateStatus (toEmail: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'Welcome to AllDoors Onlne',
            text: 'Congratulations, your account has been activated.',
            html: this.newTextMail({
                headingText: 'Thank you for choosing AllDoors Onlne!',
                mainText: `We have activated your account and you can start using it right now. Just follow this link ${this.mainDomain}/login and enter your username and password.`
            })
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    private static newMail (mail: any) {
        const emailTemplate: any = fs.readFileSync(`${parentDir}/templates/email.template`)
        const template = _.template(emailTemplate)
        const html = template({
            template_logo: this.template_logo,
            title: mail.title,
            text: mail.text,
            link: mail.link,
            button_text: mail.button_text,
            end_text: mail.end_text
        })
        return html
    }

    public static async sendCardholderInvite (toEmail: string, token: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'You have been invited to AllDoors Onlne',
            text: 'has invited you',
            html: this.newMail({
                title: 'You have been invited to AllDoors Onlne',
                text: 'You are invited to register an account. Please follow the link and fill in the company details. Thank you.',
                link: `${this.mainDomain}/cardholder/invite/${token}`,
                button_text: 'Choose new Password'
            })// `<h2>Unimacs company has invited you to make a registration. Please click link bellow ${this.mainDomain}/registration/${item.token}</h2>`
        }
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    private static newTextMail (mail: { headingText: string, mainText: string, otherText?: string, }) {
        const emailTemplate: any = fs.readFileSync(`${parentDir}/templates/text.email.template`)
        const template = _.template(emailTemplate)
        const html = template({
            template_logo: this.template_logo,
            headingText: mail.headingText,
            otherText: mail.otherText,
            mainText: mail.mainText
        })
        return html
    }

    private static newSuperTextMail (mail: {
        first_name: string
        last_name: string
        email: string
        phone_number: string
        message: string
        company_name: string
        account_id: number
    }) {
        const emailTemplate: any = fs.readFileSync(`${parentDir}/templates/super_text.email.template`)
        const template = _.template(emailTemplate)
        const html = template({
            first_name: mail.first_name,
            last_name: mail.last_name,
            email: mail.email,
            phone_number: mail.phone_number,
            message: mail.message,
            company_name: mail.company_name,
            account_id: mail.account_id
        })
        return html
    }
}
