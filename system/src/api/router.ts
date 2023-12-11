import { Router } from "express"
import authRouter from "./auth/authRouter.js"
import portfolioRouter from "./portfolio/portfolioRouter.js"
import { fetchPreciseStockDataFromAPI, storeRawStockDataInDb } from "../stock/fetchData.js"

const router = Router()

router.use("/auth", authRouter)
router.use("/portfolio", portfolioRouter)

// Stock debug
router.get("/stockDebug", async (req, res) => {
	const data = await fetchPreciseStockDataFromAPI("F", 2023, 12)
	// await storeRawStockDataInDb(data)

	res.send(data)
	// res.send("200 OK")
})

export default router
