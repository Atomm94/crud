import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent,
    // getManager,
    RemoveEvent
} from 'typeorm'
import { Limitation } from '../entity'
// import * as Models from '../entity'
import { CardholderGroup } from '../entity/CardholderGroup'
import { Cardholder } from '../entity/Cardholder'
import LogController from '../../controller/LogController'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<CardholderGroup> {
    /**
     * Indicates that this subscriber only listen to Company events.
     */
    listenTo () {
        return CardholderGroup
    }

    /**
 * Called after entity update.
 */
    async afterUpdate (event: UpdateEvent<CardholderGroup>) {
        const { entity: New, databaseEntity: Old } = event
        if (New) {
            const cache_key = `${New.company}:cg_${New.id}:acr_*:cr_*`
            await LogController.invalidateCache(cache_key)
        }

        // limitation
        if ((New?.limitation_inherited !== Old.limitation_inherited && New?.limitation_inherited === true) || New?.limitation !== Old.limitation) {
            const childs = await CardholderGroup.find({ where: { parent_id: New?.id } })

            for (const child of childs) {
                if (child.limitation_inherited === true) {
                    child.limitation = New?.limitation
                    await child.save()
                }
            }

            const cardholders = await Cardholder.find({ where: { cardholder_group: New?.id } })
            for (const cardholder of cardholders) {
                if (cardholder.limitation_inherited === true) {
                    cardholder.limitation = New?.limitation
                    await cardholder.save()
                }
            }

            if (New?.limitation_inherited !== Old.limitation_inherited && New?.limitation_inherited === true) {
                await Limitation.destroyItem(Old.limitation)
            }
        }

        // antipass_back
        if ((New?.antipass_back_inherited !== Old.antipass_back_inherited && New?.antipass_back_inherited === true) ||
            //  || New?.antipass_back !== Old.antipass_back
            New?.enable_antipass_back !== Old.enable_antipass_back
        ) {
            const childs = await CardholderGroup.find({ where: { parent_id: New?.id } })
            for (const child of childs) {
                if (child.antipass_back_inherited === true) {
                    // child.antipass_back = New?.antipass_back
                    child.enable_antipass_back = New?.enable_antipass_back
                    await child.save()
                }
            }

            const cardholders = await Cardholder.find({ where: { cardholder_group: New?.id } })
            for (const cardholder of cardholders) {
                if (cardholder.antipass_back_inherited === true) {
                    // cardholder.antipass_back = New?.antipass_back
                    cardholder.enable_antipass_back = New?.enable_antipass_back
                    await cardholder.save()
                }
            }

            // if (New?.antipass_back_inherited !== Old.antipass_back_inherited && New?.antipass_back_inherited === true) {
            //     AntipassBack.destroyItem(Old.antipass_back)
            // }
        }

        // access_right
        if ((New?.access_right_inherited !== Old.access_right_inherited && New?.access_right_inherited === true) || New?.access_right !== Old.access_right) {
            const childs = await CardholderGroup.find({ where: { parent_id: New?.id } })
            for (const child of childs) {
                if (child.access_right_inherited === true) {
                    child.access_right = New?.access_right
                    await child.save()
                }
            }

            const cardholders = await Cardholder.find({ where: { cardholder_group: New?.id } })
            for (const cardholder of cardholders) {
                if (cardholder.access_right_inherited === true) {
                    cardholder.access_right = New?.access_right
                    await cardholder.save()
                }
            }
        }

        // time_attendance
        if ((New?.time_attendance_inherited !== Old.time_attendance_inherited && New?.time_attendance_inherited === true) || New?.time_attendance !== Old.time_attendance) {
            const childs = await CardholderGroup.find({ where: { parent_id: New?.id } })
            for (const child of childs) {
                if (child.time_attendance_inherited === true) {
                    child.time_attendance = New?.time_attendance
                    await child.save()
                }
            }

            const cardholders = await Cardholder.find({ where: { cardholder_group: New?.id } })
            for (const cardholder of cardholders) {
                if (cardholder.time_attendance_inherited === true) {
                    cardholder.time_attendance = New?.time_attendance
                    await cardholder.save()
                }
            }
        }
    }

    /**
     * Called after post insertion.
     */

    async afterRemove (event: RemoveEvent<CardholderGroup>) {
        // const data = event.databaseEntity
    }
}
