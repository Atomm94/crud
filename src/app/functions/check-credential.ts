
import { Credential } from '../model/entity/Credential'
import { credentialType } from '../enums/credentialType.enum'
import { credentialStatus } from '../enums/credentialStatus.enum'
import { credentialInputMode } from '../enums/credentialInputMode.enum'

export class CheckCredentialSettings {
    public static checkSettings (credentials: Credential | Credential[] | null) {
        console.log('checkSettings credentials', credentials)

        if (credentials) {
            if (!Array.isArray(credentials)) credentials = [credentials]
            for (const credential of credentials) {
                if (Object.values(credentialType).indexOf(credential.type) === -1) {
                    return ('Invalid Credential type')
                } else {
                    if (Object.values(credentialStatus).indexOf(credential.status) === -1) {
                        return ('Invalid Credential status')
                    } else {
                        if (Object.values(credentialInputMode).indexOf(credential.input_mode) === -1) {
                            return ('Invalid Input Mode')
                        }
                    }
                }
            }
        }
        return true
    }
}
