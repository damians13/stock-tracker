import { Router } from "express"
import db from "../../util/db.js"
import bcrypt from "bcrypt"
import { AccountEventType, logAccountEvent } from "../../util/log.js"
import { DateTime, getDateTime } from "../../util/dateTime.js"
import { createNewInactiveSession } from "../../util/sessions.js"

const router = Router()

router.post("/", async (req, res) => {
	let queryResponse = await db.query(`SELECT id FROM account WHERE EMAIL = '${req.body.email}'`)

	if (queryResponse.rowCount !== 0) {
		// There is already a user registered with that email, log the registration attempt
		let accountId: number = queryResponse.rows[0].id
		await handleDuplicateRegistrationEvent(accountId, req.socket.remoteAddress)

		res.status(409)
		res.send("There is already a user registered with that email address.")

		return
	}

	// Verify that all the required fields are present
	if (req.body.name === undefined || req.body.email === undefined || req.body.password === undefined) {
		res.status(400)
		res.send("Missing information. Please include name, email, and password fields.")
	}

	const salt = await bcrypt.genSalt(10)
	const hash = await bcrypt.hash(req.body.password, salt)

	await registerNewUser(req.body.name, req.body.email, hash, salt, req.socket.remoteAddress)

	res.status(201)
	res.send("Account created.")
})

async function registerNewUser(name: string, email: string, passwordHash: string, passwordSalt: string, ip?: string) {
	let dateTime = getDateTime()

	// Create the account in the database
	let accountInsertResult = await db.query(`INSERT INTO account (
		client_name,
		email,
		password_hash,
		password_salt
	) VALUES (
		'${name}',
		'${email}',
		'${passwordHash}',
		'${passwordSalt}'
	) RETURNING id`)
	let accountId: number = accountInsertResult.rows[0].id

	// Create an inactive auth session for the account (to log the registration event)
	let authSessionId = await createNewInactiveSession(accountId, dateTime, ip)

	// Log the registration event in the database
	await logAccountEvent(db, authSessionId, AccountEventType.REGISTER, dateTime)
}

async function handleDuplicateRegistrationEvent(accountId: number, ip?: string) {
	let dateTime = getDateTime()

	// Create an inactive auth session for the account (to log the duplicate registration attempt)
	let authSessionId = await createNewInactiveSession(accountId, dateTime, ip)

	// Log the duplicate registration attempt in the database
	await logAccountEvent(db, authSessionId, AccountEventType.DUPLICATE_REGISTER_ATTEMPT, dateTime)
}

export default router
