import * as dotenv from "dotenv"
import express from "express"
import { Client } from "pg"

dotenv.config({ path: __dirname + "/../.env" })

const app = express()
const port = 8000

const pg = new Client({
	host: "db",
	port: 5432,
	database: process.env.PGDATABASE,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
})

app.get("/", async (req, res) => {
	res.send("Hello World!")

	await pg.connect()
	console.log("Connected to database")
	let result = await pg.query("SELECT * FROM Account")
	console.log(result)
	console.log("Disconnected from database")
})

app.listen(port, () => {
	console.log(`System server listening on port ${port}`)
})

async function cleanup(exitCode: number | undefined = 0) {
	// Close the connection to the database
	await pg.end()
	process.exit(exitCode)
}

process.on("exit", async exitCode => {
	cleanup()
})
process.on("SIGINT", async exitCode => {
	cleanup()
})
process.on("SIGABRT", async exitCode => {
	cleanup()
})
process.on("SIGTERM", async exitCode => {
	cleanup()
})
