import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './index'

@Entity('jwt_token')
export class JwtToken extends MainEntity {
    @Column('int', { name: 'account', nullable: true })
    account: number | null

    @Column('longtext', { name: 'token', nullable: false })
    token: string

    @Column('int', { name: 'expire_time', nullable: false })
    expire_time: number

    @Column('boolean', { name: 'expired', default: false })
    expired: boolean

    gettingActions = false
    gettingAttributes = false

    public static async addItem (data: JwtToken): Promise<JwtToken> {
        const jwtToken = new JwtToken()

        jwtToken.account = data.account
        jwtToken.token = data.token
        jwtToken.expire_time = data.expire_time

        return new Promise((resolve, reject) => {
            this.save(jwtToken)
                .then((item: JwtToken) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }
}
