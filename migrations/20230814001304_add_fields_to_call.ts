import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("call", (table) => {
    table.string("from_number", 16).notNullable(); // +18326460869
    table.string("to_number", 16).notNullable(); // +13467871111
    table.boolean("was_answered").notNullable().defaultTo(false); // true
    table.string("status", 100);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("call", (table) => {
    table.dropColumn("from_number");
    table.dropColumn("to_number");
    table.dropColumn("was_answered");
    table.dropColumn("status");
  });
}
