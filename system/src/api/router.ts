import { Router } from "express"
import authRouter from "./auth/authRouter.js"
import portfolioRouter from "./portfolio/portfolioRouter.js"
import { fetchStockDataFromAPI, storeRawStockDataInDb } from "../stock/fetchData.js"

const router = Router()

router.use("/auth", authRouter)
router.use("/portfolio", portfolioRouter)

// Stock debug
router.get("/stockDebug", async (req, res) => {
	const data = await fetchStockDataFromAPI("F")
	await storeRawStockDataInDb(data)
	res.send("200 OK")
})

export default router
