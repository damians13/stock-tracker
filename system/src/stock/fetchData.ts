import request, { Response } from "request"
import { promisify } from "node:util"
import db from "../util/db.js"

const stockApiBaseUrl = "https://www.alphavantage.co/query"

const asyncGet = promisify(request.get)

async function isStockInDatabase(ticker: string): Promise<boolean> {
	const stockQueryResponse = await db.query(`SELECT * from stock WHERE ticker = ${ticker}`)
	return stockQueryResponse.rowCount > 0
}

// async function isStockDataUpToDate

async function fetchStockData(ticker: string) {
	/*
	if (stock is in database) {
		if (stock data is up to date) {
			query database and return data
		} else {
			query alphavantage api
			store results in historical_stock_price table
			return data
		}
	} else {
		query alphavantage api
		create entry in stock table
		store results in historical_stock_price table
		return data
	}
	*/
}

export async function storeRawStockDataInDb(data: any) {
	const ticker: string = data["Meta Data"]["2. Symbol"]
	console.log(ticker)
}

// TODO: Use outputsize=full only if stock data is missing / out of date for 100 days, use outputsize=compact if stock data is present within the last 100 days
export async function isStockDataAvailableWithin100Days(ticker: string): Promise<boolean> {
	return false
}

// TODO: Use outputsize=full only if stock data is missing / out of date for 100 minutes, use outputsize=compact if stock data is present within the last 100 minutes
export async function isStockDataAvailableWithin100Minutes(ticker: string): Promise<boolean> {
	return false
}

/**
 * This function fetches overview (daily) stock data from the AlphaVantage API for the specified ticker
 */
export async function fetchOverviewStockDataFromAPI(ticker: string) {
	const outputsize = (await isStockDataAvailableWithin100Days(ticker)) ? "compact" : "full"
	const stockApiFullUrl = `${stockApiBaseUrl}?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=${outputsize}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
	const response = await asyncGet({ url: stockApiFullUrl, json: true, headers: { "User-Agent": "request" } })
	return response.body
}

/**
 * This function fetches minute specific stock data from the AlphaVantage API for the specified year, month, and ticker
 */
export async function fetchPreciseStockDataFromAPI(ticker: string, year: number, month: number) {
	const outputsize = (await isStockDataAvailableWithin100Minutes(ticker)) ? "compact" : "full"
	const stockApiFullUrl = `${stockApiBaseUrl}?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=1min&outputsize=${outputsize}&month=${year}-${month}&extended_hours=false&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
	const response = await asyncGet({ url: stockApiFullUrl, json: true, headers: { "User-Agent": "request" } })
	return response.body
}
