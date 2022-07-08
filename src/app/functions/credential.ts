import { credentialType } from '../enums/credentialType.enum'
import { Cardholder } from '../model/entity'

export function filterCredentialToSendDevice (cardholders: Cardholder | Cardholder[]) {
    if (!Array.isArray(cardholders)) cardholders = [cardholders]

    return cardholders.filter((cardholder: Cardholder) => {
        cardholder.credentials = cardholder.credentials.filter(credential => (credential.type !== credentialType.VIKEY && credential.code))
        return cardholder.credentials.length
    })
}

export function calculateCredentialsKeysCountToSendDevice (cardholders: Cardholder | Cardholder[]) {
    if (!Array.isArray(cardholders)) cardholders = [cardholders]

    let keys_count = 0
    for (const cardholder of cardholders) {
        for (const credential of cardholder.credentials) {
            if (credential.type !== credentialType.VIKEY && credential.code) keys_count++
        }
    }
    return keys_count
}
