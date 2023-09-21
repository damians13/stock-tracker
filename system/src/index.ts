import * as dotenv from "dotenv"
import express from "express"
import { Client } from "pg"
import apiRouter from "./api/router"

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

// Bind the API router to the application
app.use("/api", apiRouter)

app.get("/", async (req, res) => {
	res.send("Hello World!")

	console.log("Connected to database")
	let result = await pg.query("SELECT * FROM Account")
	console.log(result)
})

app.listen(port, async () => {
	await pg.connect()
	console.log(`System server connected to db and listening on port ${port}`)
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
