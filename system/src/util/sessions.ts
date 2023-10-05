import db from "../util/db.js"
import { DateTime, getDateTime } from "../util/dateTime.js"

export async function createNewInactiveSession(accountId: number, dateTime: DateTime = getDateTime(), ip?: string): Promise<number> {
	let authSessionInsertResult = await db.query(
		`INSERT INTO auth_session (
			account_id,
			created_date,
			created_time,
			created_by_system,
			${ip !== undefined ? " ip_address," : " "}
			is_active
		) VALUES (
			${accountId},
			'${dateTime.dateString}',
			'${dateTime.timeString}',
			TRUE,
			${ip !== undefined ? " '" + ip + "'," : " "}
			FALSE
		) RETURNING id`
	)

	let authSessionId: number = authSessionInsertResult.rows[0].id

	return authSessionId
}

export async function createNewActiveAuthSession(accountId: number, dateTime: DateTime = getDateTime(), ip?: string): Promise<number> {
	let authSessionInsertResult = await db.query(
		`INSERT INTO auth_session (
			account_id,
			created_date,
			created_time,
			${ip !== undefined ? " ip_address," : " "}
			is_active
		) VALUES (
			${accountId},
			'${dateTime.dateString}',
			'${dateTime.timeString}',
			${ip !== undefined ? " '" + ip + "'," : " "}
			TRUE
		) RETURNING id`
	)

	let authSessionId: number = authSessionInsertResult.rows[0].id

	return authSessionId
}
