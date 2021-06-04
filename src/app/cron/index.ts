
import * as Cron from 'cron'
import { JwtToken } from '../model/entity/JwtToken'

export default class CronJob {
    public static cronObj: any = {}
    public static async startCrons () {
        this.deleteOldTokens('0 0 0 * * *')
    }

    public static deleteOldTokens (interval: string): void {
        this.cronObj[interval] = new Cron.CronJob(interval, async () => {
            const jwt_tokens: JwtToken[] = await JwtToken.find()
            const current_time = new Date().getTime()
            for (const jwt_token of jwt_tokens) {
                const expire_date = new Date(jwt_token.createDate).getTime() + 24 * 60 * 60 * 1000 // jwt_token.expire_time * 60 * 60 * 1000
                if (current_time > expire_date) {
                    JwtToken.delete(jwt_token.id)
                }
            }
        }).start()
    }
}
