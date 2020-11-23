import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent
} from 'typeorm'
import * as Models from '../entity'
import { Admin, CompanyResources, Packet, Role } from '../entity'
import { Company } from '../entity/Company'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Company> {
    /**
     * Indicates that this subscriber only listen to Company events.
     */
    listenTo () {
        return Company
    }

    /**
     * Called after post insertion.
     */
    async afterInsert (event: InsertEvent<Company>) {
        const data = event.entity
        const newCompanyResource = {
            company: data.id,
            used: '{}'
        }
        CompanyResources.addItem(newCompanyResource as CompanyResources)
    }

    /**
     * Called after post updated.
     */
    async afterUpdate (event: UpdateEvent<Company>) {
        const { entity: New, databaseEntity: Old } = event
        if (New.packet && New.packet === Old.packet && Old.status === 'pending' && New.status === 'enable') {
            if (New.account) {
                const account = await Admin.findOne(New.account)
                if (account && account.role) {
                    const account_role: Role | undefined = await Role.findOne(account.role)
                    const default_role: Role | undefined = await Role.findOne({ slug: 'default_partner', company: null })
                    const packet: Packet | undefined = await Packet.findOne(New.packet) // get softDelete too
                    if (account_role && packet) {
                        // generate account permissions
                        const permissions: any = {}
                        const default_permissions = (default_role) ? JSON.parse(default_role.permissions) : Role.default_partner_role
                        const extra_settings = JSON.parse(packet.extra_settings)

                        const models: any = Models
                        Object.keys(extra_settings.resources).forEach(resource => {
                            if (extra_settings.resources[resource]) {
                                if (models[resource] && models[resource].gettingActions) {
                                    const actions = models[resource].getActions()
                                    Object.keys(actions).forEach(action => {
                                        actions[action] = true
                                    })
                                    permissions[resource] = {
                                        actions: actions
                                    }
                                }
                            }
                        })

                        Object.keys(extra_settings.features).forEach(model => {
                            Object.keys(extra_settings.features[model]).forEach(feature => {
                                if (extra_settings.features[model][feature]) {
                                    if (models[model] && models[model].features) {
                                        if (models[model].features[feature]) {
                                            const actions = models[model].features[feature].getActions()
                                            Object.keys(actions).forEach(action => {
                                                actions[action] = true
                                            })
                                            permissions[feature] = {
                                                actions: actions
                                            }
                                        }
                                    }
                                }
                            })
                        })

                        Object.keys(default_permissions).forEach(model => {
                            if (!permissions[model]) {
                                permissions[model] = default_permissions[model]
                            }
                        })

                        account_role.permissions = JSON.stringify(permissions)
                        await account_role.save()
                    }
                }
            }
        }
    }
}
