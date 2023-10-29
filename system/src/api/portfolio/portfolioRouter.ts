import { json, Router } from "express"
import newRouter from "./new.js"
import deleteRouter from "./delete.js"

const router = Router()

router.use(json())

router.use("/new", newRouter)
router.use("/delete", deleteRouter)

export default router
