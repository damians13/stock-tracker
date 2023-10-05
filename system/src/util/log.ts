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
export async function logAccountEvent(db: Client, authSessionId: number, eventType: AccountEventType, dateTime: DateTime = getDateTime(), message?: string): Promise<number> {
	let accountQueryResult = await db.query(`SELECT account_id FROM auth_session WHERE id = ${authSessionId}`)

	// Include the message as the log_message if it is given
	let logInsertResult = await db.query(
		`INSERT INTO log_event (
			auth_session_id,
			created_date,
			created_time
			${message !== undefined ? `, log_message` : ""}
		) VALUES (
			${authSessionId},
			'${dateTime.dateString}',
			'${dateTime.timeString}'
			${message !== undefined ? ", '" + message + "'" : ""}
		) RETURNING id`
	)

	let accountId: number = accountQueryResult.rows[0].account_id
	let logId: number = logInsertResult.rows[0].id

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
