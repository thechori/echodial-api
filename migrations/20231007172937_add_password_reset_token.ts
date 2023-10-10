import { Knex } from "knex";

// id: number
// user_id: number
// token: string
// created_at: timestamp
// updated_at: timestamp
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("password_reset_token", (table) => {
    table.increments("id").primary(); // 1
    table
      .integer("user_id") // 1
      .unsigned()
      .references("id")
      .inTable("user")
      .notNullable();
    table.string("token", 255);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("password_reset_token");
}
