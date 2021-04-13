
import { Credential } from '../model/entity/Credential'
import { credentialType } from '../enums/credentialType.enum'
import { credentialStatus } from '../enums/credentialStatus.enum'
import { credentialInputMode } from '../enums/credentialInputMode.enum'

export class CheckCredentialSettings {
    public static checkSettings (credential: Credential | null) {
        console.log('checkSettings credentials', credential)

        if (credential) {
            // for (const credential of credentials) {
            if (Object.values(credentialType).indexOf(credential.type) === -1) {
                return ('Invalid Connection type')
            } else {
                if (Object.values(credentialStatus).indexOf(credential.status) === -1) {
                    return ('Invalid Connection status')
                } else {
                    if (Object.values(credentialInputMode).indexOf(credential.input_mode) === -1) {
                        return ('Invalid Input Mode')
                    }
                }
            }
            // }
        }
        return true
    }
}
