import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("user", (table) => {
    table.string("phone", 12).unique().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("user", (table) => {
    table.dropUnique(["phone"]);
  });
}
