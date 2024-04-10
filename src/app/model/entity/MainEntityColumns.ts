import {
    PrimaryGeneratedColumn,
    Index
} from 'typeorm'
import { MainEntity } from './MainEntity'

export class MainEntityColumns extends MainEntity {
    @Index()
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;
}
