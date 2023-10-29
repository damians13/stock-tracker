import { Router } from "express"
import db from "../../util/db.js"
import { AuthSessionIdIssueEventType, logGenericEvent, logInvalidAuthSessionId } from "../../util/log.js"
import { DateTime, getDateTime } from "../../util/dateTime.js"

const router = Router()

router.post("/", async (req, res) => {
	const authQueryResponse = await db.query(
		`SELECT au.is_active, au.account_id, ac.client_name FROM auth_session au JOIN account ac ON au.account_id = ac.id WHERE au.id = ${req.body.authSessionId}`
	)

	if (authQueryResponse.rowCount === 0) {
		// Invalid authSessionId
		await logInvalidAuthSessionId(db, req.body.authSessionId, AuthSessionIdIssueEventType.DELETE_PORTFOLIO, req.socket.remoteAddress)

		res.status(404)
		res.send("There is no auth session with that ID.")
		return
	}

	const isActive: boolean = authQueryResponse.rows[0].is_active

	if (!isActive) {
		// The given auth session is inactive
		await logGenericEvent(db, req.body.authSessionId, `Attempted to delete portfolio "${req.body.portfolioName}", but the auth session is inactive`)

		res.status(403)
		res.send("The auth session with the given ID is inactive.")
		return
	}

	const accountId: number = authQueryResponse.rows[0].account_id
	const dateTime = getDateTime()

	const usedPortfolioNamesResponse = await db.query(`SELECT portfolio_name FROM portfolio WHERE account_id = ${accountId}`)
	const usedPortfolioNames: string[] = usedPortfolioNamesResponse.rows.map(row => row.portfolio_name)

	if (!usedPortfolioNames.includes(req.body.portfolioName)) {
		await logGenericEvent(db, req.body.authSessionId, `Attempted to delete portfolio "${req.body.portfolioName}", but this client has no such portfolio`, dateTime)

		res.status(404)
		res.send("This client has no portfolio with the given name.")
		return
	}

	const clientName: string = authQueryResponse.rows[0].client_name

	await deletePortfolio(accountId, req.body.portfolioName, req.body.authSessionId, dateTime)

	res.send(`Deleted the portfolio named "${req.body.portfolioName}" for ${clientName}`)
})

async function deletePortfolio(accountId: number, portfolioName: string, authSessionId: number, dateTime: DateTime = getDateTime()) {
	// Delete the portfolio
	await db.query(`DELETE FROM portfolio WHERE account_id = ${accountId} AND portfolio_name = '${portfolioName}'`)

	// Log the delete event
	await logGenericEvent(db, authSessionId, `Deleted portfolio "${portfolioName}"`, dateTime)
}

export default router
