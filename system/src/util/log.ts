import { Client } from "pg"
import { DateTime, getDateTime } from "./dateTime.js"

export enum AccountEventType {
	REGISTER = "REGISTER",
	DUPLICATE_REGISTER_ATTEMPT = "DUPLICATE_REGISTER_ATTEMPT",
	LOGIN = "LOGIN",
	LOGOUT = "LOGOUT",
	FAILED_LOGIN_ATTEMPT = "FAILED_LOGIN_ATTEMPT",
	FAILED_LOGOUT_ATTEMPT = "FAILED_LOGOUT_ATTEMPT",
	CREATE_PORTFOLIO = "CREATE_PORTFOLIO",
	DETELE_PORTFOLIO = "DELETE_PORTFOLIO",
}

export enum PortfolioEventType {
	NEW = "NEW",
	DELETE = "DELETE",
	RENAME = "RENAME",
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

export async function logPortfolioEvent(
	db: Client,
	authSessionId: number,
	portfolioName: string,
	eventType: PortfolioEventType,
	dateTime: DateTime = getDateTime(),
	message?: string
): Promise<number> {
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

	await db.query(`INSERT INTO portfolio_log_event (
		id,
		account_id,
		portfolio_name,
		log_type
	) VALUES (
		${logId},
		${accountId},
		'${portfolioName}'
		'${eventType}'
	)`)

	return logId
}
