import {
    Entity,
    Column,
    OneToMany,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
    Index
} from 'typeorm'

import { acuStatus } from '../../enums/acuStatus.enum'
import { networkValidation, interfaceValidation, timeValidation } from '../../functions/validator'
import { MainEntityColumns } from './MainEntityColumns'
import { AccessPoint } from './AccessPoint'
import { ExtDevice } from './ExtDevice'
import { acuModel } from '../../enums/acuModel.enum'
import { acuCloudStatus } from '../../enums/acuCloudStatus.enum'

import { minusResource } from '../../functions/minusResource'
import SendSocketMessage from '../../mqtt/SendSocketMessage'
import { socketChannels } from '../../enums/socketChannels.enum'
import { Company } from './Company'
import { AcuStatus } from './AcuStatus'
import { AutoTaskSchedule } from './AutoTaskSchedule'
import { Reader } from './Reader'
import { AccessPointStatus } from './AccessPointStatus'
import LogController from '../../controller/LogController'

@Entity('acu')
@Index('serial_number|company|is_delete', ['serial_number', 'company', 'is_delete'], { unique: true })
@Index('acu_delete_date', ['deleteDate'])
export class Acu extends MainEntityColumns {
    @Column('varchar', { name: 'name', nullable: true })
    name: string | null

    @Column('bigint', { name: 'serial_number', nullable: true })
    serial_number: number

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('enum', { name: 'model', nullable: false, enum: acuModel })
    model: string

    @Column('enum', { name: 'status', nullable: false, enum: acuStatus, default: acuStatus.PENDING })
    status: acuStatus

    @Column('enum', { name: 'cloud_status', nullable: false, enum: acuCloudStatus, default: acuCloudStatus.OFFLINE })
    cloud_status: acuCloudStatus

    @Column('varchar', { name: 'fw_version', nullable: true })
    fw_version: string | null

    @Column('boolean', { name: 'maintain_update_manual', default: true })
    maintain_update_manual: boolean

    @Column('boolean', { name: 'elevator_mode', default: false })
    elevator_mode: boolean

    @Column('longtext', { name: 'network', nullable: true })
    network: string | null

    @Column('longtext', { name: 'interface', nullable: true })
    interface: string | null

    @Column('longtext', { name: 'time', nullable: true })
    time: string | null

    @Column('varchar', { name: 'session_id', nullable: true })
    session_id: string | null

    @Column('varchar', { name: 'username', nullable: true })
    username: string | null

    @Column('varchar', { name: 'password', nullable: true })
    password: string | null

    @Column('boolean', { name: 'heart_bit', default: false })
    heart_bit: boolean

    @Column('int', { name: 'reader', nullable: true })
    reader: number | null

    @Column('varchar', { name: 'rev', nullable: true }) // HW Ver
    rev: string | null

    @Column('varchar', { name: 'api_ver', nullable: true }) // API Ver
    api_ver: string | null

    @Column('varchar', { name: 'acu_comment', nullable: true }) // ACU Comment
    acu_comment: string | null

    @Column('datetime', { name: 'registration_date', nullable: true }) // ACU Comment
    registration_date: string | null

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @Column('varchar', { name: 'is_delete', default: 0 })
    is_delete: string

    @OneToMany(type => AccessPoint, access_point => access_point.acus)
    access_points: AccessPoint[];

    @OneToMany(type => ExtDevice, ext_device => ext_device.acus)
    ext_devices: ExtDevice[];

    @ManyToOne(type => Company, company => company.acus, { nullable: true })
    @JoinColumn({ name: 'company' })
    companies: Company | null;

    @OneToOne(type => AcuStatus, acu_status => acu_status.acus)
    acu_statuses: AcuStatus;

    @OneToMany(type => AutoTaskSchedule, auto_task_schedule => auto_task_schedule.acus)
    auto_task_schedules: AutoTaskSchedule[];

    @OneToMany(type => AccessPointStatus, access_point_status => access_point_status.acus)
    access_point_statuses: AutoTaskSchedule[];

    @OneToOne(type => Reader, Reader => Reader.acus, { nullable: true })
    @JoinColumn({ name: 'reader' })
    readers: Reader | null;

    public static time_fields_that_used_in_sending: Array<string> = [
        'daylight_saving_time_from_user_account',
        'enable_daylight_saving_time',
        'time_zone',
        'time_zone_unix',
        'timezone_from_facility'
    ]

    public static time_required_fields_for_sending: Array<string> = [
        'time_zone_unix'
    ]

    public static async addItem (data: any) {
        const acu = new Acu()

        acu.name = data.name
        acu.description = data.note
        // acu.serial_number = data.serial_number
        acu.model = data.model // check or no ??
        acu.status = acuStatus.PENDING
        acu.fw_version = data.fw_version
        acu.company = data.company
        if ('reader' in data) acu.reader = data.reader

        return new Promise((resolve, reject) => {
            if (data.time) {
                const check_time = timeValidation(data.time)
                if (!check_time) {
                    reject(check_time)
                } else {
                    acu.time = JSON.stringify(data.time)
                }
            }
            this.save(acu, { transaction: false })
                .then((item: Acu) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Acu): Promise<{ [key: string]: any }> {
        const acu = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, acu)

        if ('name' in data) acu.name = data.name
        if ('description' in data) acu.description = data.description
        // if ('serial_number' in data) acu.serial_number = data.serial_number
        if ('model' in data) acu.model = data.model
        if ('status' in data) acu.status = data.status
        if ('fw_version' in data) acu.fw_version = data.fw_version
        if ('maintain_update_manual' in data) acu.maintain_update_manual = data.maintain_update_manual
        if ('elevator_mode' in data) acu.elevator_mode = data.elevator_mode
        if ('network' in data) acu.network = data.network
        if ('interface' in data) acu.interface = data.interface
        if ('reader' in data) acu.reader = data.reader

        if (!acu) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            if (data.network) {
                const check_network = networkValidation(data.network)
                if (!check_network) {
                    reject(check_network)
                } else {
                    acu.network = JSON.stringify(data.network)
                }
            }
            if (data.interface) {
                const check_interface = interfaceValidation(data.interface)
                if (!check_interface) {
                    reject(check_interface)
                } else {
                    acu.interface = JSON.stringify(data.interface)
                }
            }
            if (data.time) {
                const check_time = timeValidation(data.time)
                if (!check_time) {
                    reject(check_time)
                } else {
                    acu.time = (data.time && typeof data.time === 'object') ? JSON.stringify(data.time) : data.time
                }
            }
            // if (data.maintain) {
            //     const check_maintain = maintainValidation(data.time)
            //     if (!check_maintain) {
            //         reject(check_maintain)
            //     }
            // }

            this.save(acu, { transaction: false })
                .then((item: Acu) => {
                    resolve({
                        old: oldData,
                        new: item
                    })
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getItem (where: any, relations?: Array<string>): Promise<Acu> {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
                relations: relations || []
            })
                .then((item: Acu) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (data: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.findOneOrFail({ where: { id: data.id, company: data.company } }).then((data: any) => {
                this.softRemove(data)
                    .then(async () => {
                        minusResource(this.name, data.company)
                        const acu_data: any = await this.createQueryBuilder('acu')
                            .where('id = :id', { id: data.id })
                            .withDeleted()
                            .getOne()
                        acu_data.is_delete = (new Date()).getTime()
                        await this.save(acu_data, { transaction: false })

                        const cache_key = `${data.company}:acu_${data.serial_number}`
                        await LogController.invalidateCache(cache_key)

                        const cache_update_key = `acu:acu_statuses:${data.company}*`
                        await LogController.invalidateCache(cache_update_key)

                        const promises = []
                        promises.push(Acu.createQueryBuilder('acu')
                            .select('acu.status')
                            .addSelect('COUNT(acu.id) as acu_qty')
                            .where(`acu.company = ${data.company}`)
                            .groupBy('acu.status')
                            .getRawMany())

                        promises.push(Acu.createQueryBuilder('acu')
                            .innerJoin('acu.access_points', 'access_point', 'access_point.delete_date is null')
                            .select('acu.status')
                            .addSelect('COUNT(access_point.id) as acp_qty')
                            .where(`access_point.company = ${data.company}`)
                            .groupBy('acu.status')
                            .getRawMany())

                        const [d_acus, d_access_points]: any = await Promise.all(promises)
                        const send_data = {
                            acus: d_acus,
                            access_points: d_access_points

                        }
                        new SendSocketMessage(socketChannels.DASHBOARD_ACU, send_data, data.company)

                        if (data.status === acuStatus.ACTIVE || data.status === acuStatus.PENDING) {
                            // delete CronJob.active_devices[data.id]
                            await AcuStatus.destroyItem({ acu: data.id })
                        }

                        const access_points: any = await AccessPoint.getAllItems({ where: { acu: { '=': data.id } }/* , relations: ['readers', 'access_rules'] */ })
                        for (const access_point of access_points) {
                            AccessPoint.destroyItem({ id: access_point.id, company: access_point.company })
                        }
                        const ext_devices: any = await ExtDevice.getAllItems({ where: { acu: { '=': data.id } } })
                        for (const ext_device of ext_devices) {
                            ExtDevice.destroyItem({ id: ext_device.id, company: ext_device.company })
                        }
                        const auto_task_schedules: any = await AutoTaskSchedule.getAllItems({ where: { acu: { '=': data.id } } })
                        for (const auto_task_schedule of auto_task_schedules) {
                            AutoTaskSchedule.destroyItem({ id: auto_task_schedule.id, company: auto_task_schedule.company })
                        }

                        resolve({ message: 'success' })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            }).catch((error: any) => {
                reject(error)
            })
        })
    }

    public static async getAllItems (params?: any) {
        return new Promise((resolve, reject) => {
            this.findByParams(
                {
                    ...params,
                    relations: params.relations ? params.relations : []
                })
                .then((items) => {
                    resolve(items)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }
}

// removed models
// "LRM3CRS": {
//     "access_points_count": 1,
//     "access_point_types": {
//         "door": true,
//         "turnstile_one_side": true,
//         "turnstile_two_side": false,
//         "gate": true,
//         "gateway": true,
//         "floor": false
//     },
//     "readers": {
//         "RFID": true,
//         "KEYPAD": true,
//         "FINGER": false,
//         "FACE": false
//     },
//     "inputs": 3,
//     "outputs": 1,
//     "floor_count": 0
// },
// "LR3CBS": {
//     "access_points_count": 1,
//     "access_point_types": {
//         "door": true,
//         "turnstile_one_side": false,
//         "turnstile_two_side": false,
//         "gate": false,
//         "gateway": false,
//         "floor": false
//     },
//     "readers": {
//         "RFID": true,
//         "KEYPAD": true,
//         "FINGER": false,
//         "FACE": false
//     },
//     "inputs": 3,
//     "outputs": 1,
//     "floor_count": 0
// },
// "LR3C2E": {
//     "access_points_count": 2,
//     "access_point_types": {
//         "door": true,
//         "turnstile_one_side": true,
//         "turnstile_two_side": true,
//         "gate": true,
//         "gateway": true,
//         "floor": false
//     },
//     "readers": {
//         "RFID": true,
//         "KEYPAD": true,
//         "FINGER": true,
//         "FACE": true
//     },
//     "inputs": 6,
//     "outputs": 5,
//     "floor_count": 0
// },
// "LR3C4E": {
//     "access_points_count": 4,
//     "access_point_types": {
//         "door": true,
//         "turnstile_one_side": true,
//         "turnstile_two_side": true,
//         "gate": true,
//         "gateway": true,
//         "floor": false
//     },
//     "readers": {
//         "RFID": true,
//         "KEYPAD": true,
//         "FINGER": true,
//         "FACE": true
//     },
//     "inputs": 12,
//     "outputs": 9,
//     "floor_count": 0
// }
