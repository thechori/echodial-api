import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("user", (table) => {
    table.string("stripe_customer_id");
    table.string("stripe_subscription_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("user", (table) => {
    table.dropColumn("stripe_customer_id");
    table.dropColumn("stripe_subscription_id");
  });
}
