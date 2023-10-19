import { Router } from "express"
import authRouter from "./auth/authRouter.js"
import portfolioRouter from "./portfolio/portfolioRouter.js"

const router = Router()

router.use("/auth", authRouter)
router.use("/portfolio", portfolioRouter)

export default router
