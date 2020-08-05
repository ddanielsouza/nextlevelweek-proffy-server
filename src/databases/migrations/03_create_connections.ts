import Knex from 'knex';

export async function up(knex: Knex){
    return knex.schema.createTable('connections', table =>{
        table.increments('id').primary();

        table.integer('created_at')
            .notNullable()
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

        table.integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    })
}

export async function down(knex: Knex){
    knex.schema.dropTableIfExists('connections');
}