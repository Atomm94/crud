import { MigrationInterface, QueryRunner } from 'typeorm'
const client_id = ''
const client_secret = ''
const code = ''
const scope = ''
const redirect_uri = ''
const product_id = ''
const organization_id = ''

export class CreateDefaultBilling1648032861152 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO zoho (
            client_id,
            client_secret,
            code,
            scope,
            redirect_uri,
            product_id
            organization_id) VALUES ('${client_id}','${client_secret}', '${code}', '${scope}', '${redirect_uri}', '${product_id}', '${organization_id}')`)
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
    }
}
