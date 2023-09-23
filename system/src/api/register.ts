import { Router } from "express"
import db from "../db.js"
import bcrypt from "bcrypt"

const router = Router()

router.post("/", async (req, res) => {
	let queryResponse = await db.query(`SELECT * FROM Account WHERE EMAIL = '${req.body.email}'`)

	if (queryResponse.rowCount !== 0) {
		// There is already a user registered with that email
		res.status(409)
		res.send("There is already a user registered with that email address.")
		return
	}

	const dateObj = new Date()

	// Verify that all the required fields are present
	if (req.body.name === undefined || req.body.email === undefined || req.body.password === undefined) {
		res.status(400)
		res.send("Missing information. Please include name, email, and password fields.")
	}

	const year = dateObj.getUTCFullYear()
	const formattedMonth = ("0" + (dateObj.getMonth() + 1)).slice(-2)
	const formattedDay = ("0" + dateObj.getDate()).slice(-2)
	const dateString = `${year}-${formattedMonth}-${formattedDay}`

	const salt = await bcrypt.genSalt(10)
	const hash = await bcrypt.hash(req.body.password, salt)

	// Create the account
	db.query(`INSERT INTO Account (
		name,
		email,
		password_hash,
		password_salt,
		registered_date
	) VALUES (
		'${req.body.name}',
		'${req.body.email}',
		'${hash}',
		'${salt}',
		'${dateString}'
	)`)

	res.status(201)
	res.send("Account created.")
})

export default router
