import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    getManager
} from 'typeorm'
import * as Models from '../entity'
import { Admin, CompanyResources, Role } from '../entity'
import { Company } from '../entity/Company'
import { statusCompany } from '../../enums/statusCompany.enum'
import { Feature } from '../../middleware/feature'
const featureList: any = Feature
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
        if (New.packet && New.packet === Old.packet && Old.status === 'pending' && New.status === 'enabled') {
            if (New.account) {
                const account = await Admin.findOne(New.account)
                if (account && account.role) {
                    const account_role: Role | undefined = await Role.findOne(account.role)
                    const default_role: Role | undefined = await Role.findOne({ slug: 'default_partner', company: null })
                    // const packet: Packet | undefined = await Packet.findOne(New.packet) // get softDelete too
                    let packet: any = await getManager().query(`SELECT * FROM packet where id = ${New.packet}`)

                    if (account_role && packet.length) {
                        packet = packet[0]
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
                                console.log(feature)

                                if (extra_settings.features[model][feature]) {
                                    console.log('extra_settings', extra_settings.features[model][feature])

                                    if (featureList[model] && featureList[model][feature]) {
                                        const modelName = (featureList[model][feature].model) ? featureList[model][feature].model : model
                                        if (featureList[model][feature].module) {
                                            const actions = models[modelName].getActions()
                                            Object.keys(actions).forEach(action => {
                                                actions[action] = true
                                            })
                                            if (permissions[modelName]) {
                                                permissions[modelName].action = actions
                                            } else {
                                                permissions[modelName] = {
                                                    actions: actions
                                                }
                                            }
                                        } else {
                                            if (permissions[modelName]) {
                                                if (permissions[modelName].features) {
                                                    permissions[modelName].features[feature] = true
                                                } else {
                                                    permissions[modelName].features = {
                                                        [feature]: true
                                                    }
                                                }
                                            } else {
                                                permissions[modelName] = {
                                                    features: {
                                                        [feature]: true
                                                    }
                                                }
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
                        console.log(permissions)

                        account_role.permissions = JSON.stringify(permissions)

                        await account_role.save()
                    }
                }
            }
        }
    }

    /**
     * Called after entity update.
     */
    async beforeUpdate (event: UpdateEvent<Company>) {
        const { entity: New, databaseEntity: Old } = event
        if (New.packet !== Old.packet && Old.status === 'enabled') {
            New.status = statusCompany.PENDING
        }
    }
}
