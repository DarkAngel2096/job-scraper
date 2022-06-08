// module requires
import querystring from "querystring";


// variables to create the url
let urlBase = "https://duunitori.fi/tyopaikat";
let urlPlace = "pääkaupunkiseutu";
let urlSearch = "software developer";
let searchPage = 1;

let fullURL = encodeURI(`${urlBase}/${urlPlace}/${urlSearch}?sivu=`);

//console.log(fullURL + searchPage);

let data = await apiCall(fullURL);
let dataSplit = data.data.split("\n");

console.log(dataSplit.length);

dataSplit.map((elem, index) => {
	if (elem.match(/avoimet työpaikat/gi) && elem.startsWith("<h1")) {
		console.log(`row: "${index}" has: "${elem}"`);
		console.log(dataSplit[index + 2]);
		console.log(dataSplit[index + 2].match(/<b>(.*)<\/b>/g));
	}
});












// helper functions
import https from "https";

// function that does the actual API call
async function apiCall(endpoint) {
	// create and return a new promise, this way we can await for the response
	return new Promise((resolve, reject) => {
		// make a GET call to the endpoint (which has the query params already added)
		https.get(endpoint, (res) => {
			// if the response is less than 200, or more than 300 something probably went wrong, catch these
			if (res.statusCode < 200 || res.statusCode > 299) {
				// if one of these was found, resolve this with a message showing the code and a "problem" status
				resolve({message: `Server responded with code: ${res.statusCode}`, status: "problem", statusCode: res.statusCode});
			}

			let data = "";

			// on data respose add to the data variable, on end response resolve the promise with the data and an "ok" status
			res.on("data", (chunk) => { data += chunk; }).on("end", () => { resolve({data: data, status: "ok"}); });
		}).on("error", (err) => { console.log(err); });
	});
}
