
import { Credential } from '../model/entity/Credential'
import { credentialType } from '../enums/credentialType.enum'
import { credentialStatus } from '../enums/credentialStatus.enum'
import { credentialInputMode } from '../enums/credentialInputMode.enum'

export class CheckCredentialSettings {
    public static checkSettings (data: Credential) {
        console.log(data)

        if (Object.values(credentialType).indexOf(data.type) === -1) {
            return ('Invalid Connection type')
        } else {
            if (Object.values(credentialStatus).indexOf(data.status) === -1) {
                return ('Invalid Connection status')
            } else {
                if (Object.values(credentialInputMode).indexOf(data.input_mode) === -1) {
                    return ('Invalid Input Mode')
                } else {
                    return true
                }
            }
        }
    }
}
