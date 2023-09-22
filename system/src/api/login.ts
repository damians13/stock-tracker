import express, { Router } from "express"
import db from "../db.js"

const router = express.Router()

router.get("/", (req, res) => {
	res.send("Login time")
})

router.post("/", async (req, res) => {
	let dbresp = await db.query(`SELECT * FROM Account WHERE NAME = '${req.body.name}'`)
	res.send(dbresp.rows)
})

export default router
