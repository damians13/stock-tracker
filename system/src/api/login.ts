import { Router } from "express"
import db from "../util/db.js"
import bcrypt from "bcrypt"

const router = Router()

router.get("/", (req, res) => {
	res.send("Login time")
})

router.post("/", async (req, res) => {
	let queryResponse = await db.query(`SELECT * FROM account WHERE EMAIL = '${req.body.email}'`)

	if (queryResponse.rowCount === 0) {
		// No user in the database with that email
		res.status(404)
		res.send("There is no registered account with that email address.")
		return
	}

	const account = queryResponse.rows[0] // Since email is unique in the db

	// Check if the supplied password is correct
	const match = await bcrypt.compare(req.body.password, account.password_hash)

	if (match) {
		res.send(`Logged in ${account.name}`)
	} else {
		res.status(403)
		res.send(`Incorrect password`)
	}
})

export default router
