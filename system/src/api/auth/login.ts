import { Router } from "express"
import db from "../../util/db.js"
import bcrypt from "bcrypt"
import { DateTime, getDateTime } from "../../util/dateTime.js"
import { AccountEventType, logAccountEvent } from "../../util/log.js"
import { createNewActiveAuthSession, createNewInactiveSession } from "../../util/sessions.js"

interface Account {
	id: number
	client_name: string
	email: string
	password_hash: string
	password_salt: string
}

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

	const account: Account = queryResponse.rows[0]

	// Check if the supplied password is correct
	const match = await bcrypt.compare(req.body.password, account.password_hash)

	const dateTime = getDateTime()

	if (match) {
		let authSessionId = await createNewActiveAuthSession(account.id, dateTime, req.socket.remoteAddress)
		await logAccountEvent(db, authSessionId, AccountEventType.LOGIN, dateTime)
		res.json({ message: `Logged in ${account.client_name}`, authSessionId: authSessionId })
	} else {
		let authSessionId = await createNewInactiveSession(account.id, dateTime, req.socket.remoteAddress)
		await logAccountEvent(db, authSessionId, AccountEventType.FAILED_LOGIN_ATTEMPT, dateTime)
		res.status(403)
		res.send(`Incorrect password`)
	}
})

export default router
