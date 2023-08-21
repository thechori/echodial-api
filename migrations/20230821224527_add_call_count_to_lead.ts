import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("lead", (table) => {
    table.integer("call_count").notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("lead", (table) => {
    table.dropColumn("call_count");
  });
}
