import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

/** App/info tables (`info_*`). */
export const task = pgTable('info_task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});
