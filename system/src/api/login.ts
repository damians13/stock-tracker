import express, { Router } from "express"

const router = express.Router()

router.get("/", (req, res) => {
	res.send("Login time")
})

export default router
