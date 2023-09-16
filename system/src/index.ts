import * as dotenv from "dotenv"

dotenv.config({ path: __dirname + "/../.env" })

console.log(process.env.POSTGRES_USER)

// const sql = postgres(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@0.0.0.0:5432/postgres`)

// async function test() {
// 	return await sql`SELECT * FROM Account`
// }

// console.log(test())
