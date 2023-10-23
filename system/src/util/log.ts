import { Client } from "pg"
import { DateTime, getDateTime } from "./dateTime.js"
import { createNewInactiveSession } from "./sessions.js"

export enum AccountEventType {
	REGISTER = "REGISTER",
	DUPLICATE_REGISTER_ATTEMPT = "DUPLICATE_REGISTER_ATTEMPT",
	LOGIN = "LOGIN",
	LOGOUT = "LOGOUT",
	FAILED_LOGIN_ATTEMPT = "FAILED_LOGIN_ATTEMPT",
	FAILED_LOGOUT_ATTEMPT = "FAILED_LOGOUT_ATTEMPT",
}

/**
 * Current problem is that some of the portfolio log events don't relate to
 * an existing portfolio, so the database returns a foreign key violation
 *
 * Need to figure out how to get around this properly
 *  - Could remove the fkey constraint
 *  - Could move these log events to general or account
 *    - Maybe then add non-existing authSessionId logging to general
 *      for account and portfolio?
 */

export enum PortfolioEventType {
	NEW = "NEW",
	DELETE = "DELETE",
	RENAME = "RENAME",
	ATTEMPTED_NEW_PORTFOLIO_DUPLICATE_NAME = "ATTEMPTED_NEW_PORTFOLIO_DUPLICATE_NAME",
}

export enum AuthSessionIdIssueEventType {
	LOGOUT = "LOGIN",
	NEW_PORTFOLIO = "NEW_PORTFOLIO",
	DELETE_PORTFOLIO = "DELETE_PORTFOLIO",
	RENAME_PORTFOLIO = "RENAME_PORTFOLIO",
}

/**
 * Log information about an account to the database
 * @param db Database client connection
 * @param authSessionId ID of the auth session that created the logged event
 * @param eventType The type of the logged event
 * @param dateTime The date and time of the event
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

/**
 * Log information about a portfolio to the database
 * @param db Database client connection
 * @param authSessionId ID of the auth session that created the logged event
 * @param portfolioName The name of the portfolio that the event is associated with
 * @param eventType The type of the logged event
 * @param dateTime The date and time of the event
 * @param message Message to go along with the log event in the database
 * @returns The id of the created log event
 */
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
		'${portfolioName}',
		'${eventType}'
	)`)

	return logId
}

/**
 * Log information about a generic event to the database
 * @param db Database client connection
 * @param authSessionId ID of the auth session that created the logged event
 * @param message Message to go along with the log event in the database
 * @param dateTime The date and time of the event
 * @returns The id of the created log event
 */
export async function logGenericEvent(db: Client, authSessionId: number, message: string, dateTime: DateTime = getDateTime()): Promise<number> {
	let logInsertResult = await db.query(
		`INSERT INTO log_event (
			auth_session_id,
			created_date,
			created_time,
			log_message
		) VALUES (
			${authSessionId},
			'${dateTime.dateString}',
			'${dateTime.timeString}',
			${message}
		) RETURNING id`
	)

	let logId: number = logInsertResult.rows[0].id

	await db.query(`INSERT INTO generic_log_event (
		id
	) VALUES (
		${logId},
	)`)

	return logId
}

export async function logInvalidAuthSessionId(
	db: Client,
	invalidAuthSessionId: number,
	eventType: AuthSessionIdIssueEventType,
	ip: string | undefined,
	dateTime: DateTime = getDateTime()
) {
	// Create an inactive system auth session
	const authSessionId = await createNewInactiveSession(0, dateTime, ip)

	// Log the event
	await logGenericEvent(db, authSessionId, `Attempted ${eventType} with invalid authSessionId: ${invalidAuthSessionId}`, dateTime)
}
