import { Router } from "express"
import db from "../../util/db.js"

const router = Router()

router.get("/", (req, res) => {
	res.send("Create a new portfolio")
})

router.post("/", async (req, res) => {
	let authQueryResponse = await db.query(
		`SELECT au.is_active, au.account_id, ac.client_name FROM auth_session au JOIN account ac ON au.account_id = ac.id WHERE au.id = ${req.body.authSessionId}`
	)

	if (authQueryResponse.rowCount === 0) {
		// Invalid authSessionId
		res.status(404)
		res.send("There is no auth session with that ID.")
		return
	}

	const isActive: boolean = authQueryResponse.rows[0].is_active

	if (!isActive) {
		// The given auth session is inactive
		res.status(403)
		res.send("The auth session with the given ID is inactive.")
		return
	}

	const accountId: number = authQueryResponse.rows[0].account_id
	const clientName: string = authQueryResponse.rows[0].client_name

	let usedPortfolioNamesResponse = await db.query(`SELECT portfolio_name FROM portfolio WHERE account_id = ${accountId}`)
	if (authQueryResponse.rowCount !== 0) {
		// The account has 1 or more portfolios, check for duplicate name
		const usedPortfolioNames: string[] = usedPortfolioNamesResponse.rows.map(row => row.portfolio_name)

		usedPortfolioNames.forEach(s => console.log(s))

		if (usedPortfolioNames.includes(req.body.portfolioName)) {
			// The account already has a portfolio with the requested name

			res.status(409)
			res.send(`${clientName} already has a portfolio named "${req.body.portfolioName}".`)
			return
		}
	}

	await db.query(`INSERT INTO portfolio (
		account_id,
		portfolio_name
	) VALUES (
		${accountId},
		'${req.body.portfolioName}'
	)`)

	res.send(`Created a portfolio named "${req.body.portfolioName}" for ${clientName}.`)
})

export default router
