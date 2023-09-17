import * as dotenv from "dotenv"
import express from "express"

dotenv.config({ path: __dirname + "/../.env" })

const app = express()
const port = 8000

app.get("/", (req, res) => {
	res.send("Hello World!")
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
