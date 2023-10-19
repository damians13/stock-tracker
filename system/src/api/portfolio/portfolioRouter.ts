import { json, Router } from "express"
import newRouter from "./new.js"

const router = Router()

router.use(json())

router.use("/new", newRouter)

export default router
