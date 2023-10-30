import request, { Response } from "request"
import { promisify } from "node:util"

const stockApiBaseUrl = "https://www.alphavantage.co/query"

const asyncGet = promisify(request.get)

export async function storeRawStockDataInDb(data: any) {
	const ticker: string = data["Meta Data"]["2. Symbol"]
	console.log(ticker)
}

export async function fetchStockDataFromAPI(ticker: string) {
	const stockApiFullUrl = `${stockApiBaseUrl}?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
	const response = await asyncGet({ url: stockApiFullUrl, json: true, headers: { "User-Agent": "request" } })
	return response.body
}
