import { config } from '../../config'
import { Company, Package } from '../model/entity'
import { Zoho } from '../model/entity/Zoho'
import { postBodyRequest, postBodyRequestForToken } from '../services/requestUtil'

export async function updateZohoConfig (zoho?: Zoho) {
    if (!zoho) zoho = await Zoho.findOne()
    if (zoho) {
        if (zoho.client_id) config.zoho.client_id = zoho.client_id
        if (zoho.client_secret) config.zoho.client_secret = zoho.client_secret
        if (zoho.code) config.zoho.code = zoho.code
        if (zoho.scope) config.zoho.scope = zoho.scope
        if (zoho.redirect_uri) config.zoho.redirect_uri = zoho.redirect_uri
        if (zoho.product_id) config.zoho.product_id = zoho.product_id
        if (zoho.organization_id) config.zoho.organization_id = zoho.organization_id
        if (zoho.access_token) config.zoho.access_token = zoho.access_token
        if (zoho.refresh_token) config.zoho.refresh_token = zoho.refresh_token
        if (zoho.token_expire_time) config.zoho.token_expire_time = zoho.token_expire_time
    }
    return true
}

export async function updateTokenFromRefreshToken () {
    try {
        const zoho = await Zoho.findOne()
        if (zoho) {
            if (!config.zoho.token_expire_time || new Date().getTime() - 2 * 60 * 1000 > Number(config.zoho.token_expire_time)) {
                const tokenBody = {
                    refresh_token: config.zoho.refresh_token,
                    client_id: config.zoho.client_id,
                    client_secret: config.zoho.client_secret,
                    redirect_uri: config.zoho.redirect_uri,
                    grant_type: 'refresh_token'
                }

                const linkForToken = config.zoho.urls.tokenFromRefreshTokenUrl
                let token: any = await postBodyRequestForToken(linkForToken, tokenBody)
                token = JSON.parse(token)
                if (token.error) {
                    return false
                } else {
                    zoho.access_token = token.access_token
                    zoho.token_expire_time = String(new Date().getTime() + token.expires_in * 1000)
                    await zoho.save()
                    await updateZohoConfig(zoho)
                    await sendAllNotSyncedToZoho()
                }
            }
        }
        return true
    } catch (error) {
        console.log('updateTokenFromRefreshToken error', error)
        return false
    }
}

export async function createPlan (package_data: Package) {
    try {
        const check_token = await updateTokenFromRefreshToken()
        if (check_token) {
            const createPlan = config.zoho.urls.createPlanUrl
            const body = {
                plan_code: String(package_data.id),
                name: package_data.name,
                recurring_price: package_data.price,
                interval: 1,
                product_id: config.zoho.product_id,
                description: JSON.stringify(package_data.extra_settings)
            }

            const headers = {
                'X-com-zoho-subscriptions-organizationid': config.zoho.organization_id,
                Authorization: `Zoho-oauthtoken ${config.zoho.access_token}`,
                'Content-Type': 'application/json'
            }

            const plan: any = await postBodyRequest(createPlan, body, headers)
            if (plan.code === 0 || plan.code === 100502) {
                package_data.create_package_zoho_sync = true
                await package_data.save()
            }
        }
    } catch (error) {
        console.log('createPlan error', error)
    }
}

export async function createCustomer (company_id: Number) {
    try {
        const check_token = await updateTokenFromRefreshToken()
        if (check_token) {
            const company: any = await Company.findOneOrFail({ where: { id: company_id }, relations: ['company_account'] })
            const admin = company.company_account
            const headers = {
                'X-com-zoho-subscriptions-organizationid': config.zoho.organization_id,
                Authorization: `Zoho-oauthtoken ${config.zoho.access_token}`,
                'Content-Type': 'application/json'
            }
            const createCustomer = config.zoho.urls.createCustomerUrl
            const bodyForCustomer = {
                display_name: `${admin.first_name}(${admin.id})`,
                email: admin.email,
                company_name: company.name,
                phone: company.company_account.phone_1
            }

            const customer: any = await postBodyRequest(createCustomer, bodyForCustomer, headers)
            if (customer.code === 0) {
                company.create_customer_zoho_sync = true
                company.zoho_customer_id = customer.customer.customer_id
                await company.save()
            }
        }
    } catch (error) {
        console.log('createCustomer error', error)
    }
}

export async function createSubsciption (company_id: Number) {
    try {
        const check_token = await updateTokenFromRefreshToken()
        if (check_token) {
            const company = await Company.findOneOrFail({ where: { id: company_id }, relations: ['company_account'] })
            if (company.zoho_customer_id) {
                const headers = {
                    'X-com-zoho-subscriptions-organizationid': config.zoho.organization_id,
                    Authorization: `Zoho-oauthtoken ${config.zoho.access_token}`,
                    'Content-Type': 'application/json'
                }
                const createSubsciption = config.zoho.urls.createSubscriptionUrl
                const bodyForSubsciption = {
                    customer_id: company.zoho_customer_id,
                    auto_collect: false,
                    plan: {
                        plan_code: String(company.upgraded_package_id)
                    }
                }
                const subscription: any = await postBodyRequest(createSubsciption, bodyForSubsciption, headers)
                if (subscription.code === 0) {
                    company.create_subscription_zoho_sync = true
                    await company.save()
                }
            }
        }
    } catch (error) {
        console.log('createSubsciption error', error)
    }
}

export async function sendAllNotSyncedToZoho () {
    const packages: any = await Package.createQueryBuilder('package')
        .where('create_package_zoho_sync = false')
        .withDeleted()
        .getMany()
    for (const package_data of packages) {
        await createPlan(package_data)
    }

    const companies = await Company.find({
        where: [
            { create_customer_zoho_sync: false },
            { create_subscription_zoho_sync: false }
        ]
    })
    for (const company of companies) {
        if (company.create_customer_zoho_sync) {
            await createCustomer(company.id)
        }
        if (company.create_subscription_zoho_sync) {
            await createSubsciption(company.id)
        }
    }
}
