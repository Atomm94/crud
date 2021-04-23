import { MigrationInterface, QueryRunner } from 'typeorm'
import { Role } from '../entity/Role'
const slug = 'default_partner'
const permissions = Role.default_partner_role

export class createDeafaultRole1605524671196 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO role(slug, permissions) VALUES ('${slug}', '${JSON.stringify(permissions)}')`)
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM role WHERE slug = '${slug}' AND company IS NULL`)
    }
}
