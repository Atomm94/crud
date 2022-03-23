import { config } from '../../config'
import { Zoho } from '../model/entity/Zoho'

export async function updateZohoConfig () {
    const zoho = await Zoho.findOne()
    if (zoho) {
        if (zoho.client_id) config.zoho.client_id = zoho.client_id
        if (zoho.client_secret) config.zoho.client_secret = zoho.client_secret
        if (zoho.code) config.zoho.code = zoho.code
        if (zoho.scope) config.zoho.scope = zoho.scope
        if (zoho.redirect_uri) config.zoho.redirect_uri = zoho.redirect_uri
        if (zoho.product_id) config.zoho.product_id = zoho.product_id
        if (zoho.organization_id) config.zoho.organization_id = zoho.organization_id
    }
    return true
}
