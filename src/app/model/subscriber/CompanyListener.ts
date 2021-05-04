import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    getManager,
    Not
} from 'typeorm'
import * as Models from '../entity'
import { Admin, CompanyResources, Role } from '../entity'
import { Company } from '../entity/Company'
import { Acu } from '../entity/Acu'
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
        if (Old.status !== New.status) {
            if (Old.status === statusCompany.DISABLE && New.status === statusCompany.ENABLE) {
                const accounts = await Admin.find({ company: New.id, status: false })
                for (const account of accounts) {
                    account.status = true
                    await account.save()
                }
            } else if (New.status === statusCompany.DISABLE) {
                const accounts = await Admin.find({ company: New.id, status: true })
                for (const account of accounts) {
                    account.status = false
                    await account.save()
                }
            } else if (Old.status === statusCompany.DISABLE && New.status === statusCompany.PENDING) {
                const account = await Admin.findOneOrFail({ where: { id: New.account } })
                account.status = true
                await account.save()
            } else if (Old.status === statusCompany.ENABLE && New.status === statusCompany.PENDING) {
                const accounts = await Admin.find({ where: { company: New.id, id: Not(New.account), status: true } })
                for (const account of accounts) {
                    account.status = false
                    await account.save()
                }
            }
        }

        if (New.package && New.package === Old.package && Old.status === statusCompany.PENDING && New.status === statusCompany.ENABLE) {
            if (New.account) {
                const account = await Admin.findOne(New.account)
                if (account && account.role) {
                    const account_role: Role | undefined = await Role.findOne(account.role)
                    const default_role: Role | undefined = await Role.findOne({ slug: 'default_partner', company: null })
                    // const package: Package | undefined = await Package.findOne(New.package) // get softDelete too
                    let package_data: any = await getManager().query(`SELECT * FROM package where id = ${New.package}`)

                    if (account_role && package_data.length) {
                        package_data = package_data[0]
                        // generate account permissions
                        const permissions: any = {}
                        const default_permissions = (default_role) ? JSON.parse(default_role.permissions) : Role.default_partner_role
                        // const role_permissions =
                        const role_permissions = Role.getActions()
                        Object.keys(role_permissions).forEach(action => {
                            role_permissions[action] = true
                        })
                        if (default_permissions.Role) {
                            default_permissions.Role.actions = { ...role_permissions, ...default_permissions.Role.actions }
                        } else {
                            default_permissions.Role = {
                                actions: { ...role_permissions }
                            }
                        }

                        const acu_permissions = Acu.getActions()
                        Object.keys(acu_permissions).forEach(action => {
                            acu_permissions[action] = true
                        })
                        default_permissions.Acu = {
                            actions: { ...acu_permissions }
                        }

                        const extra_settings = JSON.parse(package_data.extra_settings)

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
        if (New.package !== Old.package && Old.status === 'enabled') {
            New.status = statusCompany.PENDING
        }
    }
}
