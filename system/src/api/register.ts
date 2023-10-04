import { Router } from "express"
import db from "../util/db.js"
import bcrypt from "bcrypt"
import { AccountEventType, logAccountEvent } from "../util/log.js"
import { DateTime, getDateTime } from "../util/dateTime.js"

const router = Router()

router.post("/", async (req, res) => {
	let queryResponse = await db.query(`SELECT id FROM account WHERE EMAIL = '${req.body.email}'`)

	if (queryResponse.rowCount !== 0) {
		// There is already a user registered with that email, log the registration attempt
		let accountId: Number = queryResponse.rows[0].id
		await handleDuplicateRegistrationEvent(accountId)

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

	await registerNewUser(req.body.name, req.body.email, hash, salt)

	res.status(201)
	res.send("Account created.")
})

async function createInactiveSession(accountId: Number, dateTime: DateTime = getDateTime()): Promise<Number> {
	let authSessionInsertResult = await db.query(`INSERT INTO auth_session (
		account_id,
		created_date,
		created_time,
		is_active
	) VALUES (
		${accountId},
		'${dateTime.dateString}',
		'${dateTime.timeString}',
		FALSE
	) RETURNING id`)

	let authSessionId: Number = authSessionInsertResult.rows[0].id

	return authSessionId
}

async function registerNewUser(name: String, email: String, passwordHash: String, passwordSalt: String) {
	let dateTime = getDateTime()

	// Create the account in the database
	let accountInsertResult = await db.query(`INSERT INTO account (
		name,
		email,
		password_hash,
		password_salt
	) VALUES (
		'${name}',
		'${email}',
		'${passwordHash}',
		'${passwordSalt}'
	) RETURNING id`)
	let accountId: Number = accountInsertResult.rows[0].id

	// Create an inactive auth session for the account (to log the registration event)
	let authSessionId = await createInactiveSession(accountId, dateTime)

	// Log the registration event in the database
	await logAccountEvent(db, authSessionId, AccountEventType.REGISTER, dateTime)
}

async function handleDuplicateRegistrationEvent(accountId: Number) {
	let dateTime = getDateTime()

	// Create an inactive auth session for the account (to log the duplicate registration attempt)
	let authSessionId = await createInactiveSession(accountId, dateTime)

	// Log the duplicate registration attempt in the database
	await logAccountEvent(db, authSessionId, AccountEventType.DUPLICATE_REGISTER_ATTEMPT, dateTime)
}

export default router
