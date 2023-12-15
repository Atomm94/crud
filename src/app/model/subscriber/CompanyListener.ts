import { CameraDevice } from './../entity/CameraDevice'
import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    IsNull,
    UpdateEvent,
    getManager
    // Not
} from 'typeorm'
import * as Models from '../entity'
import { Admin, CompanyResources, Role, PackageType, RegistrationInvite } from '../entity'
import { Company } from '../entity/Company'
import { Acu } from '../entity/Acu'
import { statusCompany } from '../../enums/statusCompany.enum'
import { Feature } from '../../middleware/feature'
import { adminStatus } from '../../enums/adminStatus.enum'
import { JwtToken } from '../entity/JwtToken'
import { CameraSet } from '../entity/CameraSet'
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
        if (data.parent_id) {
            const parent_company_resources = await CompanyResources.findOneOrFail({ where: { company: data.parent_id } })
            const parent_used = JSON.parse(parent_company_resources.used)
            if (parent_used[data.package_type]) {
                parent_used[data.package_type]++
            } else {
                parent_used[data.package_type] = 1
            }
            parent_company_resources.used = JSON.stringify(parent_used)
            await parent_company_resources.save()
        }

        if (data.partition_parent_id) {
            const partition_parent_company_resources = await CompanyResources.findOneOrFail({ where: { company: data.partition_parent_id } })
            const parent_used = JSON.parse(partition_parent_company_resources.used)
            if (parent_used.Company) {
                parent_used.Company++
            } else {
                parent_used.Company = 1
            }
            partition_parent_company_resources.used = JSON.stringify(parent_used)
            await partition_parent_company_resources.save()
        }
    }

    /**
     * Called after post updated.
     */
    async afterUpdate (event: UpdateEvent<Company>) {
        const { entity: New, databaseEntity: Old } = event
        if (Old.status !== New?.status) {
            if (Old.status === statusCompany.DISABLE && New?.status === statusCompany.ENABLE) {
                const accounts = await Admin.find({ where: { company: New?.id, status: adminStatus.INACTIVE } })
                for (const account of accounts) {
                    account.status = adminStatus.ACTIVE
                    await account.save()
                }
            } else if (New?.status === statusCompany.DISABLE) {
                const accounts = await Admin.find({ where: { company: New?.id, status: adminStatus.ACTIVE } })
                for (const account of accounts) {
                    account.status = adminStatus.INACTIVE
                    await account.save()
                }
            } else if (Old.status === statusCompany.DISABLE && New?.status === statusCompany.PENDING) {
                const account = await Admin.findOneOrFail({ where: { id: New?.account } })
                account.status = adminStatus.ACTIVE
                await account.save()
            } else if (Old.status === statusCompany.ENABLE && New?.status === statusCompany.PENDING) {
                // const accounts = await Admin.find({ where: { company: New?.id, id: Not(New?.account), status: adminStatus.ACTIVE } })
                // for (const account of accounts) {
                //     account.status = adminStatus.INACTIVE
                //     await account.save()
                // }
            }
        }

        if (New?.package && New?.package === Old.package && Old.status === statusCompany.PENDING && New?.status === statusCompany.ENABLE) {
            if (New?.account) {
                const account = await Admin.findOne(New?.account)
                if (account && account.role) {
                    const account_role: Role | undefined = await Role.findOne({ where: { id: account.role } }) as Role
                    const default_role: Role | undefined = await Role.findOne({ where: { slug: 'default_partner', company: IsNull() } }) as Role
                    // const package: Package | undefined = await Package.findOne(New?.package) // get softDelete too
                    let package_data: any = await getManager().query(`SELECT * FROM package where id = ${New?.package}`)
                    const package_type: any = await PackageType.findOneOrFail({ where: { id: New?.package_type } })

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

                        if (package_type.service) {
                            const reg_inv_permissions = RegistrationInvite.getActions()
                            Object.keys(reg_inv_permissions).forEach(action => {
                                reg_inv_permissions[action] = true
                            })
                            default_permissions.RegistrationInvite = {
                                actions: { ...reg_inv_permissions }
                            }

                            const companies = Company.getActions()
                            Object.keys(companies).forEach(action => {
                                companies[action] = true
                            })
                            default_permissions.Company = {
                                actions: { ...companies }
                            }
                        }

                        if (New?.parent_id) {
                            default_permissions.ServiceCompany = {
                                actions: { getItem: true }
                            }
                        } else {
                            if (package_type.service) {
                                default_permissions.CompanyDocuments = {
                                    actions: {
                                        saveFile: true,
                                        deleteFile: true,
                                        addItem: true,
                                        updateItem: true,
                                        destroyItem: true
                                    }
                                }
                            }
                        }

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

                        const cameraDevice_permissions = CameraDevice.getActions()
                        Object.keys(cameraDevice_permissions).forEach(action => {
                            cameraDevice_permissions[action] = true
                        })
                        default_permissions.CameraDevice = {
                            actions: { ...cameraDevice_permissions }
                        }

                        const cameraSet_permissions = CameraSet.getActions()
                        Object.keys(cameraSet_permissions).forEach(action => {
                            cameraSet_permissions[action] = true
                        })
                        default_permissions.CameraSet = {
                            actions: { ...cameraSet_permissions }
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

                        if (extra_settings.resources.Company) {
                            const reg_inv_permissions = RegistrationInvite.getActions()
                            Object.keys(reg_inv_permissions).forEach(action => {
                                reg_inv_permissions[action] = true
                            })
                            default_permissions.RegistrationInvite = {
                                actions: { ...reg_inv_permissions }
                            }
                        } else {
                            delete permissions.RegistrationInvite
                        }

                        if (permissions[Models.AccessPoint.name]) {
                            const models_from_access_point = [Models.AccessPointGroup.name, Models.AccessPointZone.name]
                            models_from_access_point.forEach(model => {
                                if (models[model].gettingActions) {
                                    const actions = models[model].getActions()
                                    Object.keys(actions).forEach(action => {
                                        actions[action] = true
                                    })
                                    permissions[model] = {
                                        actions: actions
                                    }
                                }
                            })
                        }

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
                        console.log(555, account_role)

                        await account_role.save()
                    }
                }
            }

            JwtToken.logoutAccounts(New?.id)
        }
    }

    /**
     * Called after entity update.
     */
    async beforeUpdate (event: UpdateEvent<Company>) {
        const { entity: New, databaseEntity: Old } = event
        if (New && New?.package !== Old.package && Old.status === 'enabled') {
            New.status = statusCompany.PENDING
        }
    }
}
