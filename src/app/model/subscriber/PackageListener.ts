import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent,
    InsertEvent
    // UpdateEvent
} from 'typeorm'
import { config } from '../../../config'
import { AccessControl } from '../../functions/access-control'
import { postBodyRequest, postBodyRequestForToken } from '../../services/requestUtil'
import { Package } from '../entity/Package'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Package> {
    /**
     * Indicates that this subscriber only listen to Package events.
     */
    listenTo () {
        return Package
    }

    /**
     * Called after entity update.
     */
    async beforeUpdate (event: UpdateEvent<Package>) {
        const { entity: New, databaseEntity: Old } = event
        if (Old.extra_settings !== New.extra_settings) {
            event.entity = Old
            delete New.id
            try {
                await Package.addItem(New)
                await Package.softRemove(await Package.find({ id: Old.id }))
            } catch (error) {
                throw new Error(error)
            }
        }
    }

    async afterInsert (event: InsertEvent<Package>) {
        const data = event.entity
        if (data.status && data.extra_settings) {
            AccessControl.addCompanyGrant(data)
        }

        const tokenBody = {
            code: config.zoho.code,
            client_id: config.zoho.client_id,
            client_secret: config.zoho.client_secret,
            redirect_uri: config.zoho.redirect_uri,
            grant_type: 'authorization_code'
        }

        const linkForToken = 'https://accounts.zoho.com/oauth/v2/token'
        const createPlan = 'https://subscriptions.zoho.com/api/v1/plans'
        const body = {
            plan_code: String(data.id),
            name: data.name,
            recurring_price: data.price,
            interval: 1,
            product_id: '2857260000000093003'
        }
        const token: any = await postBodyRequestForToken(linkForToken, tokenBody)

        const headers = {
            'X-com-zoho-subscriptions-organizationid': config.zoho.organization_id,
            Authorization: `Zoho-oauthtoken ${token.access_token}`,
            'Content-Type': 'application/json'
        }

        const plan:any = await postBodyRequest(createPlan, body, headers)
        if (!plan.code === false) {
            // need conversation..delete or no package
        }
        console.log(plan)
    }
}
