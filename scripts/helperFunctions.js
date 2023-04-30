// helper function for API calls
import https from "https";

async function apiCall(endpoint) {
	// create and return a new promise, this way we can await for the response
	return new Promise((resolve, reject) => {
		// make a GET call to the endpoint (which has the query params already added)
		https.get(endpoint, (res) => {
			// if the response is less than 200, or more than 300 something probably went wrong, catch these
			if (res.statusCode < 200 || res.statusCode > 299) {
				// if one of these was found, resolve this with a message showing the code and a "problem" status
				resolve({message: `Server responded with code: ${res.statusCode}`, status: "problem", statusCode: res.statusCode})
			}

			let data = "";

			// on data respose add to the data variable, on end response resolve the promise with the data and an "ok" status
			res.on("data", (chunk) => { data += chunk; }).on("end", () => { resolve({data: data, status: "ok"}); });
		}).on("error", (err) => { console.log(err); });
	});
}


// function to wait some specific time
function sleepSync (ms) {
	const end = new Date().getTime() + ms;
	while (new Date().getTime() < end) { /* do nothing */ }
}

//import querystring from "querystring";
import fs from "fs";

// function to get the amount of jobs from a site
async function getSiteJobCount ({ url: url, searchParams: searchParams, stringToFind: stringToFind }) {
	const test = true;

	if (test) console.log(url, searchParams, stringToFind);

	// create the url for the page to be searched, then split the page on newlines, trimming every like and filtering out empty stuff
	const fullUrl = await createUrl(url, searchParams);

	if (test) console.log(fullUrl);

	const pageDetails = await apiCall(fullUrl);

	// check if pageDetails is ok
	if (pageDetails.statusCode < 200 || pageDetails.statusCode > 299) {
		console.log(`problems found, code: "${JSON.stringify(pageDetails)}"`);
		return;
	}

	const pageSplitDetails = pageDetails.data.split("\n").map(elem => elem.trim()).filter(elem => elem.length > 0);

	//fs.writeFileSync("./Page.html", pageSplitDetails.join("\n"));
	if (test) console.log(pageSplitDetails.length);

	// create the regex for the string to find, and search for it, also checking for the specific element that is at the start of the line
	const findRegex = new RegExp(stringToFind.string, "gi");

	if (test) console.log(findRegex);

	const searchIndex = pageSplitDetails.findIndex(elem => elem.match(findRegex) && (stringToFind.startsWith ? elem.startsWith(stringToFind.startsWith) : true));

	// check if the index wasn't found
	if (!searchIndex) {
		console.log("no index found");
		return;
	}

	// now get the amount of job positions found with these search params
	const matchRegex = new RegExp(`${stringToFind.specialNumTag ? stringToFind.specialNumTag : ""}(\\d+\\s*\\d+)`, "g");

	if (test) console.log(matchRegex);

	let [jobsTotal, ...jobsRest] = pageSplitDetails[searchIndex + (stringToFind.countFoundIn ? stringToFind.countFoundIn : 0)].match(matchRegex).map(elem => parseInt(elem));

	const returnObject = {
		jobsTotal: jobsTotal,
		newJobs: stringToFind.new ? jobsTotal[0] : undefined,
		pagesTotal: Math.ceil(jobsTotal / stringToFind.jobsPerPage)
	}

	console.log(returnObject);

	//return returnObject;
}

async function createUrl (baseUrl, params) {
	const querystring = await import("querystring");

	return `${baseUrl}?${querystring.stringify(params)}`
}


export { apiCall, sleepSync, getSiteJobCount }
