import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("lead", (table) => {
      table.dropColumns("sale_amount", "sale_commission", "sale_cost");
    })
    .alterTable("lead", (table) => {
      table.decimal("sale_amount");
      table.decimal("sale_commission");
      table.decimal("sale_cost");
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("lead", (table) => {
      table.dropColumns("sale_amount", "sale_commission", "sale_cost");
    })
    .alterTable("lead", (table) => {
      table.integer("sale_amount");
      table.integer("sale_commission");
      table.integer("sale_cost");
    });
}
