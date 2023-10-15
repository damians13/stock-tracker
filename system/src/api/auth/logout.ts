import { Router, query } from "express"
import db from "../../util/db.js"
import { AccountEventType, logAccountEvent } from "../../util/log.js"
import { getDateTime } from "../../util/dateTime.js"

const router = Router()

router.get("/", (req, res) => {
	res.send("Logout time")
})

router.post("/", async (req, res) => {
	let queryResponse = await db.query(`SELECT email, is_active, client_name FROM account ac JOIN auth_session au ON au.account_id = ac.id WHERE au.id = ${req.body.authSessionId}`)

	if (queryResponse.rowCount === 0) {
		// Invalid authSessionId
		res.status(404)
		res.send("There is no auth session with that ID.")
		return
	}

	const email: string = queryResponse.rows[0].email

	const dateTime = getDateTime()

	if (email !== req.body.email) {
		// authSessionId does not match the given email
		await logAccountEvent(db, req.body.authSessionId, AccountEventType.FAILED_LOGOUT_ATTEMPT, dateTime, `Tried to logout with incorrect email: ${email}`)

		res.status(403)
		res.send("The auth session ID does not match the email.")
		return
	}

	const isAuthSessionActive: boolean = queryResponse.rows[0].is_active

	if (!isAuthSessionActive) {
		// Already logged out
		await logAccountEvent(db, req.body.authSessionId, AccountEventType.FAILED_LOGOUT_ATTEMPT, dateTime, `Tried to logout when not active`)

		res.status(403)
		res.send("The auth session is already logged out.")
		return
	}

	await logAccountEvent(db, req.body.authSessionId, AccountEventType.LOGOUT, dateTime)
	await db.query(`UPDATE auth_session SET is_active = FALSE WHERE id = ${req.body.authSessionId}`)

	const clientName: string = queryResponse.rows[0].client_name

	res.send(`Logged out ${clientName}`)
})

export default router