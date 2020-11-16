import { MigrationInterface, QueryRunner } from 'typeorm'
import * as bcrypt from 'bcrypt'

const username = 'super'
const email = 'super@gmail.com'
const password = 'admin'
const password_hash = bcrypt.hashSync(password, 10)
const super_status = true
const first_name = 'first_name'
const last_name = 'last_name'
const post_code = '0000'
const phone_1 = '+374-XX-XXX-XXX'

export class CreateSuperAdmin1604569904489 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO admin(username, email, password, super, first_name, last_name, post_code, phone_1) 
                                            VALUES ('${username}', '${email}', '${password_hash}', ${super_status}, '${first_name}', '${last_name}', '${post_code}', '${phone_1}')`)
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM admin WHERE username = '${username}'`)
    }
}
