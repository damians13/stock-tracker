import { json, Router } from "express"
import loginRouter from "./login.js"
import registerRouter from "./register.js"
import logoutRouter from "./logout.js"

const router = Router()

router.use(json())

router.use("/login", loginRouter)
router.use("/register", registerRouter)
router.use("/logout", logoutRouter)

export default router
