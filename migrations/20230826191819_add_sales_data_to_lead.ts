import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("lead", (table) => {
    table.integer("sale_amount"); // $10,000 for yearly premium
    table.integer("sale_commission"); // $1,000 for 10% cut
    table.integer("sale_cost"); // $20 for the lead
    table.text("sale_notes"); // This guy was a PITA - found through a friend, sold here, 5/10 would do business with again
    table.timestamp("sale_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("lead", (table) => {
    table.dropColumn("sale_amount");
    table.dropColumn("sale_commission");
    table.dropColumn("sale_cost");
    table.dropColumn("sale_notes");
    table.dropColumn("sale_at");
  });
}
