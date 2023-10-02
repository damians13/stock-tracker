import { Client } from "pg"
import { DateTime, getDateTime } from "./dateTime.js"

export enum AccountEventType {
	REGISTER = "REGISTER",
	DUPLICATE_REGISTER_ATTEMPT = "DUPLICATE_REGISTER_ATTEMPT",
	LOGIN = "LOGIN",
	LOGOUT = "LOGOUT",
	CREATE_PORTFOLIO = "CREATE_PORTFOLIO",
	DETELE_PORTFOLIO = "DELETE_PORTFOLIO",
}

/**
 * Log information about an account to the database
 * @param db Database client connection
 * @param authSessionId ID of the auth session that created the logged event
 * @param eventType The type of the logged event
 * @param message Message to go along with the log event in the database
 * @returns The id of the created log event
 */
export async function logAccountEvent(db: Client, authSessionId: Number, eventType: AccountEventType, dateTime: DateTime = getDateTime(), message?: String): Promise<Number> {
	let accountQueryResult = await db.query(`SELECT account_id FROM auth_session WHERE id = ${authSessionId}`)
	let logInsertResult =
		message !== undefined
			? await db.query(
					`INSERT INTO log_event (
						auth_session_id,
						created_date,
						created_time,
						log_message
					) VALUES (
						${authSessionId},
						'${dateTime.dateString}',
						'${dateTime.timeString}',
						'${message}') RETURNING id`
			  )
			: await db.query(
					`INSERT INTO log_event (
						auth_session_id,
						created_date,
						created_time
					) VALUES (
						${authSessionId},
						'${dateTime.dateString}',
						'${dateTime.timeString}'
					) RETURNING id`
			  )

	let accountId: Number = accountQueryResult.rows[0].account_id
	let logId: Number = logInsertResult.rows[0].id

	await db.query(`INSERT INTO account_log_event (
		id,
		account_id,
		log_type
	) VALUES (
		${logId},
		${accountId},
		'${eventType}'
	)`)

	return logId
}
