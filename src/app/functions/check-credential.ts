
import { Credential } from '../model/entity/Credential'
import { credentialType } from '../enums/credentialType.enum'
import { credentialStatus } from '../enums/credentialStatus.enum'
import { credentialInputMode } from '../enums/credentialInputMode.enum'
import { canCreate } from '../middleware/resource'
import { resourceKeys } from '../enums/resourceKeys.enum'
import { In } from 'typeorm'

export class CheckCredentialSettings {
    public static async checkSettings (credentials: Credential | Credential[] | null, company: number) {
        if (credentials) {
            if (!Array.isArray(credentials)) credentials = [credentials]
            const credential_unique = await Credential.findOne({ where: { company: company, code: In(credentials.map(credential => credential.code)) } })
            if (credential_unique) {
                return (`Dublicate Credential ${credential_unique.code}`)
            } else {
                for (const credential of credentials) {
                    if (Object.values(credentialType).indexOf(credential.type) === -1) {
                        return ('Invalid Credential type')
                    } else {
                        if (credential.status && Object.values(credentialStatus).indexOf(credential.status) === -1) {
                            return ('Invalid Credential status')
                        } else {
                            if (credential.input_mode && Object.values(credentialInputMode).indexOf(credential.input_mode) === -1) {
                                return ('Invalid Input Mode')
                            }
                        }
                    }
                }
            }
        }
        return true
    }

    public static async checkVirtualKeys (credentials: Credential[] | null, company: number) {
        if (credentials) {
            let virt_keys = 0
            for (const credential of credentials) {
                if (credential.type === credentialType.VIKEY && !credential.id) {
                    virt_keys++
                }
            }
            if (virt_keys) {
                const canCreateResource: boolean = await canCreate(company, resourceKeys.VIRTUAL_KEYS, virt_keys)
                if (!canCreateResource) {
                    return `${resourceKeys.VIRTUAL_KEYS} resource limit has been reached`
                }
            }
        }
        return true
    }

    public static async checkKeyPerUser (credentials: Credential[] | null, company: number) {
        if (credentials) {
            const canCreateResource: boolean = await canCreate(company, resourceKeys.KEY_PER_USER, credentials.length)
            if (!canCreateResource) {
                return `${resourceKeys.KEY_PER_USER} resource limit has been reached`
            }
        }
        return true
    }
}
