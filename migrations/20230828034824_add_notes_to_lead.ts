import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("lead", (table) => {
    table.integer("notes"); // DOB: 1/2/33 .. HEIGHT: 5"6 .. WEIGHT: 165lb
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("lead", (table) => {
    table.dropColumn("notes");
  });
}
