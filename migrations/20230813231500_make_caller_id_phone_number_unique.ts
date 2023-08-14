import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Mark phone number as unique so there are no duplicates
  return knex.schema.alterTable("caller_id", (table) => {
    table.string("phone_number", 12).notNullable().unique().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("caller_id", (table) => {
    table.string("phone_number", 12).notNullable().alter();
  });
}
