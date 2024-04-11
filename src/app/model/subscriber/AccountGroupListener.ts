import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent
    // getManager,
} from 'typeorm'
// import * as Models from '../entity'
import { AccountGroup } from '../entity/AccountGroup'
import { Admin } from '../entity/Admin'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<AccountGroup> {
    /**
     * Indicates that this subscriber only listen to Company events.
     */
    listenTo () {
        return AccountGroup
    }

    /**
 * Called after entity update.
 */
    async afterUpdate (event: UpdateEvent<AccountGroup>) {
        const { entity: New, databaseEntity: Old }: any = event

        if ((New.role !== Old.role)) {
            const childs = await AccountGroup.find({ where: { parent_id: New.id } })
            for (const child of childs) {
                if (child.role_inherited === true) {
                    child.role = New.role
                    await child.save()
                }
            }

            const accounts = await Admin.find({ where: { account_group: New.id } })
            for (const account of accounts) {
                if (account.role_inherited === true) {
                    account.role = New.role
                    type IUserNew = Partial<Admin>
                    const tmpData: IUserNew = account
                    delete tmpData.password
                    await account.save()
                }
            }
        }
    }
}
