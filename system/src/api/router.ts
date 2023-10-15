import { Router } from "express"
import authRouter from "./auth/authRouter.js"

const router = Router()

router.use("/auth", authRouter)

export default router
