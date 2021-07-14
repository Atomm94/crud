
import { acuStatus } from '../../enums/acuStatus.enum'
import { AccessPoint, AccessRule, Acu, Cardholder } from '../../model/entity'
import { AntipassBack } from '../../model/entity/AntipassBack'
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class CardKeyController {
    public static async setAddCardKey (operator: OperatorType.SET_CARD_KEYS | OperatorType.ADD_CARD_KEY, location: string, company: number, user: any, access_points: Array<{ id: number } | AccessPoint> | null, cardholders: any = null, acus: Acu[] | null = null) {
        let all_access_points: any
        if (access_points) {
            all_access_points = access_points
        } else {
            all_access_points = await AccessPoint.createQueryBuilder('access_point')
                .innerJoin('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`acu.company = ${company}`)
                .select('access_point.id')
                .getMany()
        }

        if (all_access_points.length) {
            let all_cardholders: any
            if (cardholders) {
                for (const cardholder of cardholders) {
                    if (!cardholder.antipass_backs) {
                        cardholder.antipass_backs = await AntipassBack.findOne({ where: { id: cardholder.antipass_back } })
                    }
                }
                all_cardholders = cardholders
            } else {
                // all_cardholders = await Cardholder.getAllItems({
                //     relations: [
                //         'credentials',
                //         'access_rights',
                //         'access_rights.access_rules'
                //     ],
                //     where: {
                //         company: {
                //             '=': company
                //         }
                //     }
                // })

                all_cardholders = await Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .leftJoinAndSelect('cardholder.antipass_backs', 'antipass_back')
                    .where(`cardholder.company = '${company}'`)
                    .getMany()
            }

            if (all_cardholders.length) {
                let all_acus: any
                if (acus) {
                    all_acus = acus
                } else {
                    all_acus = await Acu.getAllItems({ where: { status: { '=': acuStatus.ACTIVE }, company: { '=': company } } })
                }

                all_acus.forEach((acu: any) => {
                    const send_data = {
                        access_points: all_access_points,
                        cardholders: all_cardholders
                    }
                    new SendDeviceMessage(operator, location, acu.serial_number, send_data, user, acu.session_id)
                })
            }
        }
    }

    public static async editCardKey (location: string, company: number, user: any, access_rule: AccessRule | null, access_points: Array<{ id: number } | AccessPoint> | null = null, cardholders: Cardholder[]) {
        let send_edit_data: any
        if (access_points) {
            send_edit_data = {
                access_points: access_points
            }
        } else if (access_rule) {
            send_edit_data = {
                access_rule: access_rule
            }
        }

        if (send_edit_data) {
            let all_cardholders: any
            if (cardholders) {
                all_cardholders = cardholders
            } else {
                // all_cardholders = await Cardholder.getAllItems({
                //     relations: [
                //         'credentials',
                //         'access_rights',
                //         'access_rights.access_rules'
                //     ],
                //     where: {
                //         company: {
                //             '=': company
                //         }
                //     }
                // })

                all_cardholders = await Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .where(`cardholder.company = '${company}'`)
                    .getMany()
            }
            if (all_cardholders.length) {
                send_edit_data.cardholders = all_cardholders

                const acus: any = await Acu.getAllItems({ where: { status: { '=': acuStatus.ACTIVE }, company: { '=': company } } })
                acus.forEach((acu: any) => {
                    new SendDeviceMessage(OperatorType.EDIT_KEY, location, acu.serial_number, send_edit_data, user, acu.session_id)
                })
            }
        }
    }

    // public static async delCardKey (location: string, serial_number: number, data: any, session_id: string | null = '0') {
    //     new SendDeviceMessage(OperatorType.EDIT_KEY, location, serial_number, data, session_id)
    // }

    // public static async updateStatus (location: string, serial_number: number, data: any, session_id: string | null = '0') {
    //     new SendDeviceMessage(OperatorType.EDIT_KEY, location, serial_number, data, session_id)
    // }

    public static async dellKeys (location: string, company: string, data: any, user: any) {
        const acus: any = await Acu.getAllItems({ where: { status: { '=': acuStatus.ACTIVE }, company: { '=': company } } })
        acus.forEach((acu: any) => {
            new SendDeviceMessage(OperatorType.DELL_KEYS, location, acu.serial_number, data, user, acu.session_id)
        })
    }
}
