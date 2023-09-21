import express, { Router } from "express"
import loginRouter from "./login.js"

const router = express.Router()

router.use("/login", loginRouter)

export default router
