export interface DateTime {
	dateString: String
	timeString: String
}

const dateObj = new Date()

export function getDateTime(): DateTime {
	let year = dateObj.getUTCFullYear()
	let formattedMonth = ("0" + (dateObj.getMonth() + 1)).slice(-2)
	let formattedDay = ("0" + dateObj.getDate()).slice(-2)
	let dateString = `${year}-${formattedMonth}-${formattedDay}`

	let formattedHours = ("0" + dateObj.getUTCHours()).slice(-2)
	let formattedMinutes = ("0" + dateObj.getUTCMinutes()).slice(-2)
	let formattedSeconds = ("0" + dateObj.getUTCSeconds()).slice(-2)
	let timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`

	return { dateString, timeString }
}
