import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("caller_id", (table) => {
    table.string("email", 255).notNullable().defaultTo("");
    table.string("twilio_sid", 255).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("caller_id", (table) => {
    table.dropColumn("email");
    table.string("twilio_sid", 255).notNullable().alter(); // PN63589e2acc45ae058e148736186c7f52
  });
}
