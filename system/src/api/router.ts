import express, { Router } from "express"
import loginRouter from "./login"

const router = express.Router()

router.use("/login", loginRouter)

export default router
