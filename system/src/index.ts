import * as dotenv from "dotenv"
import express from "express"
import pg from "pg"
import apiRouter from "./api/router.js"

dotenv.config()

const app = express()
const port = 8000

const db = new pg.Client({
	host: "db",
	port: 5432,
	database: process.env.PGDATABASE,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
})

// Bind a router to the application to handle API requests in separate files
app.use("/api", apiRouter)

app.get("/", async (req, res) => {
	res.send("Hello World!")

	let result = await db.query("SELECT * FROM Account")
	console.log(result)
})

app.listen(port, async () => {
	await db.connect()
	console.log(`System server connected to db and listening on port ${port}`)
})

async function cleanup(exitCode: number | undefined = 0) {
	// Close the connection to the database
	await db.end()
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
