import { config } from '../../config'
import fs from 'fs'
import { join } from 'path'
import * as _ from 'lodash'

const parentDir = join(__dirname, '.')

const sgMail = require('@sendgrid/mail')
export class Sendgrid {
    // private static sendgrid:any = MailService
    static from: string = config.sendgrid.fromEmail
    static mainDomain: string = JSON.parse(config.cors.origin)[0]

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
            subject: 'Welcome to Unimacs.',
            text: 'has invited you',
            html: this.newMail({
                title: 'Welcome to Unimacs.',
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

    public static async sendNewPass (toEmail: string, token: string) {
        const msg = {
            to: `${toEmail}`,
            from: this.from,
            subject: 'Welcome to Unimacs.',
            text: 'has invited you',
            html: this.newMail({
                title: 'Welcome to Unimacs.',
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
            subject: 'Welcome to Unimacs.',
            text: 'has invited you',
            html: this.newMail({
                title: 'Welcome to Unimacs.',
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
                text: 'There was recently a request to change the password for your account.If you requested this change, set a new password here:',
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
            subject: 'Welcome to Unimacs',
            text: 'Congratulations, your account has been activated.',
            html: this.newMail2({
                text: 'Congratulations, your account has been activated.',
                end_text: 'Now You have access to all sections and tools.'
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
            subject: 'You have been invited to Unimacs',
            text: 'has invited you',
            html: this.newMail({
                title: 'You have been invited to Unimacs',
                text: 'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                link: `${this.mainDomain}/newpassword/${token}`,
                button_text: 'Choose new Password',
                end_text: 'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'
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

    private static newMail2 (mail: any) {
        const emailTemplate: any = fs.readFileSync(`${parentDir}/templates/updatestatus.template`)
        const template = _.template(emailTemplate)
        const html = template({
            title: mail.title,
            text: mail.text,
            end_text: mail.end_text
        })
        return html
    }
}
