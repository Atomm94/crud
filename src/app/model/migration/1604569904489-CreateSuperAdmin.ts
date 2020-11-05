import { MigrationInterface, QueryRunner } from 'typeorm'
import * as bcrypt from 'bcrypt'

const username = 'super'
const password = '123456'
const password_hash = bcrypt.hashSync(password, 10)

export class CreateSuperAdmin1604569904489 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO admin(username, email, password, super) VALUES ('${username}', 'super@gmail.com', '${password_hash}', true)`)
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM admin WHERE username = '${username}'`)
    }
}
