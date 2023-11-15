import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("lead", (table) => {
    table.string("phone").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("lead", (table) => {
    table.string("phone", 12).notNullable().defaultTo("").alter();
  });
}
