import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Purpose is to track how many free credits a user has left in their account
  return knex.schema.createTable("trial_credit", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("user")
      .notNullable();
    table.integer("initial_amount").notNullable();
    table.integer("remaining_amount").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("trial_credit");
}
