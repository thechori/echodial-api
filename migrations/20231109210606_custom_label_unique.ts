import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("lead_custom_property", (table) => {
      table.string("label").unique().alter();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("lead_custom_property", (table) => {
        table.string("label").alter();
    });
}

