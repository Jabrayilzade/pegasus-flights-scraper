const axios = require('axios')
const cron = require('node-cron')
const nodemailer = require('nodemailer')
const dayjs = require('dayjs')
const localizedFormat = require('dayjs/plugin/localizedFormat')

dayjs.extend(localizedFormat)

const getFlightDate = () => {
	return dayjs().format('YYYY-MM-DD')
}

const PEGASUS_API_URL = 'https://www.flypgs.com/apint/cheapfare/flight-calender-prices?_t=1721401742372'

const HEADERS = {
	accept: 'application/json, text/plain, */*',
	'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
	'content-type': 'application/json',
	priority: 'u=1, i',
	'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
	'sec-ch-ua-mobile': '?0',
	'sec-ch-ua-platform': '"macOS"',
	'sec-fetch-dest': 'empty',
	'sec-fetch-mode': 'cors',
	'sec-fetch-site': 'same-origin',
	cookie:
		'X-FF-CBOT=xWIaLACXI+TPB3J8WIcYSAL4dedSFVXIz697rbTWAkDuxM8qUMvN98TuhCCPNRgn; _ym_uid=1691498232465741806; _ym_d=1691498232; _hjSessionUser_266779=eyJpZCI6IjE1NzZlNDIxLWJjMGUtNTUxOS04ODdlLWZiZTllNjYxODIyMiIsImNyZWF0ZWQiOjE2OTE0OTgyMzEzOTMsImV4aXN0aW5nIjp0cnVlfQ==; _abck=F25AE12B32866E72E2AB12C678ACF664~0~YAAQRLGvw8+QeM+JAQAAg8wq1QrroEYtrgJjTFrQbLlj8InPEfNJGTq435o2ZhL2hM31Jgxqqah/Pfatu6u45m5J5V7wUe7TH9eol+LdQEX5LB7HXn+RPUXnOm7ML2F2rAT/qWDu0ICqudy+YeIdWhvkrZDjNfGpDfKGFiy3HXp9oRLyAuaWZIN62t858EcLUBUZZCAUH1XZtGhXsHzt6wg11hDoVoyB4rHqAlCJu/mcD5ySGt/8G9NYr9ilSmBp11H8wd6+te9WbJknpNvev3HmRSRPhkqgcnoc+JWnBS7qbTcSfs0PJU3PJR+xLWi60ICWQPcYk6oT65Hmtkyu1o6JzxlQKPIJ3RGpfDy6/4yQSjAIoPSN2YRJnbRiXWIXnuwyfsJmtpwtX+ANN8yk7voSSQ2VfguR~-1~||-1||~-1; language_code=EN; language_culture=en-GB; language_id=692e698c-ac4d-49dd-b5d3-7a1e51af0cfa; LANGUAGE=EN; dtCookie=v_4_srv_70_sn_89836F84A3A7CDC02E610F0A75874AD9_perc_100000_ol_0_mul_1_app-3Ad1b5f63b92282f83_0; f5avraaaaaaaaaaaaaaaa_session_=EALFKBBCCLMJBBHNIDIHOHLHGKNFDPMEIHFMGPGBNPNCENFFIHBFHMENJIFBEJKMHBIDMAJHMAAGAOHPEGEAHJGNPIFJBMKPNGOEIEFBFOKIKLHHGIIMKFEOFHIIIDHI; TS010bf771=011603e2eae4cafcdc187674121ab3a4f51356436781e7bbd668f451f57c39d4087223971528a7f18ed2298d32c24c2fc5cecb418a; HMF_CI=425a6c9680fa153acb119124320cf73ad0072db06f51bc67fd500507a3c5443509b9fcc9114996ec4e3c01fa998ad993c86715b7a76c26ac35173d2c4de771b2d3; C3VK=aefa81; language_code=EN; language_culture=en-GB; language_id=692e698c-ac4d-49dd-b5d3-7a1e51af0cfa; LANGUAGE=EN; HBB_HC=14ac213c769cf4290aabcf1e72de97830b728737004b3031801acbbe72f9c66e671cb2f158600e57b62c02d6551b45b9cc; HMY_JC=4437fe29c67b061dd2194de91a89ea39522a773bd0d33b3c9db22bdba89b63f6f1,',
	Referer: 'https://www.flypgs.com/',
	'Referrer-Policy': 'strict-origin',
}

const FLIGHT_SETTINGS = {
	currency: 'EUR',
	maxPrice: 300,
	dateRanges: {
		min: getFlightDate(),
		max: '2024-08-25',
	},
}

const INITIAL_AIRPORT = {
	name: 'Sabiha Gokcen',
	code: 'SAW',
}

const DESTINATION_AIRPORTS = [
	{ name: 'Cologne', code: 'CGN' },
	{ name: 'Dusseldorf', code: 'DUS' },
	{ name: 'Dortmund', code: 'DTM' },
	{ name: 'Bremen', code: 'BRE' },
	{ name: 'Frankfurt', code: 'FRA' },
	{ name: 'Hannover', code: 'HAJ' },
	{ name: 'Hamburg', code: 'HAM' },
	{ name: 'Padderborn/Lippstadt', code: 'PAD' },
	{ name: 'Stuttgart', code: 'STR' },
	{ name: 'Nurenberg', code: 'NUE' },
	{ name: 'Munich', code: 'MUC' },
	{ name: 'Leipzig', code: 'LEJ' },
	{ name: 'Berlin-Bradenburg', code: 'BER' },
	{ name: 'Dresden', code: 'DRS' },
]

const mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'dev.ninjadevelopment@gmail.com',
		pass: 'obbq tegf viqe oike',
		host: 'smtp.gmail.com',
		port: '465',
		ssl: true,
	},
})

const sendEmail = async html => {
	try {
		await mailTransporter.sendMail({
			from: 'dev.ninjadevelopment@gmail.com',
			to: 'cnixad@gmail.com',
			cc: 'murvatjavadov@gmail.com',
			subject: 'Flights',
			html,
		})
	} catch (error) {
		console.error('Error sending email:', error)
	}
}

function createFlightURL(airport, flight) {
	return `https://web.flypgs.com/booking?language=en&adultCount=1&arrivalPort=${airport.code}&departurePort=${INITIAL_AIRPORT.code}&currency=${FLIGHT_SETTINGS.currency}&dateOption=1&departureDate=${flight.date}`
}

function createHTMLTemplate(results) {
	let htmlContent = ''

	results.forEach(({ airport, flights }) => {
		htmlContent += `
			<strong>${INITIAL_AIRPORT.name} (${INITIAL_AIRPORT.code}) - ${airport.name} (${airport.code})</strong>
		`
		htmlContent += `<br>`
		flights.forEach(flight => {
			htmlContent += `
				<a href="${createFlightURL(airport, flight)}">
					${dayjs(flight.date, 'LL')} - ${flight.amount} ${flight.currency}
				</a>
			`

			htmlContent += `<br>`
		})

		htmlContent += `<br>`
	})

	return htmlContent
}

const getFlights = async (departureAirport, arrivalAirport) => {
	const flights = await axios
		.post(
			PEGASUS_API_URL,
			{
				depPort: departureAirport,
				arrPort: arrivalAirport,
				flightDate: '2024-08-18',
				currency: FLIGHT_SETTINGS.currency,
			},
			{
				headers: HEADERS,
			}
		)
		.then(response => {
			const cheapFareFlightCalenderModelList = response.data?.cheapFareFlightCalenderModelList ?? []

			const flights = cheapFareFlightCalenderModelList
				.map(f => f.days)
				.flat()
				.map(f => ({
					date: f.flightDate,
					amount: f.cheapFare.amount,
					currency: f.cheapFare.currency,
				}))
				.filter(f => f.amount > 0)

			return flights
		})
		.catch(error => {
			console.log(error)
		})

	return flights
}

async function run() {
	let results = []

	for (airport of DESTINATION_AIRPORTS) {
		const flights = await getFlights(INITIAL_AIRPORT.code, airport.code)

		if (flights.length > 0) {
			const acceptableFlights = flights.filter(
				f =>
					f.amount <= FLIGHT_SETTINGS.maxPrice &&
					f.date >= FLIGHT_SETTINGS.dateRanges.min &&
					f.date <= FLIGHT_SETTINGS.dateRanges.max
			)

			if (acceptableFlights.length > 0) {
				results.push({
					airport,
					flights: acceptableFlights,
				})
			}
		}
	}

	sendEmail(createHTMLTemplate(results))
}

// Run script every 2 hours
run()
cron.schedule('0 */2 * * *', () => {
	console.log('Running flight check')
	run()
})
