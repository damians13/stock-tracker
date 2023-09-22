import pg from "pg"

const db = new pg.Client({
	host: "db",
	port: 5432,
	database: process.env.PGDATABASE,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
})

export default db
