// module requires
import querystring from "querystring";
import fs from "fs";

// get start time to figure out how long things took
const startTime = Date.now();

// variables to create the url
const urlBase = "https://duunitori.fi/tyopaikat";
let searchPage = 1;

// variables to change to get different results
// both of which should be arrays of strings as input ["string1", "string2", "string3"]
const urlPlace = ["pääkaupunkiseutu"];
const urlSearch = ["software developer"];
const limitSet = true

// build the full url from the bits
let fullURL = `${urlBase}?${querystring.stringify({alue: urlPlace.join(";"), haku: urlSearch.join(";")})}`;

// variables to hold job count data
let [jobsTotal, jobsNew, jobsRest] = [0, 0, []];
let currentJobNum = 0;

// variable to contain all the jobs
let allJobs = [];

// do the first page call
let data = await apiCall(fullURL);
parseSearchPage(data.data, true);

// do math to figure out how many pages there is to do still
let totalPages = Math.ceil(jobsTotal / 20);

// log to show console what's going on
console.log(`Total of "${totalPages}" pages found, having "${jobsTotal}" jobs total ` +
	`of which "${jobsNew}" are posted within the last week.`);

// set a limit of 50 pages to go through, 1000 jobs, remove this limit by changing limitSet = false
if (limitSet && totalPages >= 50) {
	console.log("There's a lot of pages, I'm going to exit here.\n" +
		"If you want to continue go change the `limitSet` variable at the top to false and run the script again.");
	process.exit();
}

// loop through the rest of the pages and parsing those
for (let i = 2; i <= totalPages; i++) {
	console.log(`Starting work on page: "${i}"`);
	let otherData = await apiCall(`${fullURL}&sivu=${i}`);
	parseSearchPage(otherData.data);
}

// sort all the jobs according to company name in ascending order
allJobs = allJobs.sort((a, b) => {
	if (a.company < b.company) return -1;
	if (a.company > b.company) return 1;
	return 0;
});

// check if outputData folder exists
if (!fs.existsSync("./outputData")) {
	console.log("Creating output folder");
	fs.mkdirSync("./outputData", {recursive: true});
}

// write the JSON file and log out final message
fs.writeFileSync("./outputData/allJobsSimple.json", JSON.stringify(allJobs, null, "\t"));
console.log(`\nTook: "${Date.now() - startTime}"ms to do everything.\n` +
	`File called "allJobsSimple.json" written in outputData having "${allJobs.length}" jobs.`);


// function to parse the page
function parseSearchPage (data = "", firstPage = false) {
	// to start with split the data got by newlines, map through it trimming things and removing empty lines
	const splitData = data.split("\n").map(elem => elem.trim()).filter(elem => elem.length > 0);

	// if it's the first page, parse the job totals
	if (firstPage) {
		// loop through the split data to find a specific element
		for (let i = 0; i < splitData.length; i++) {
			if (splitData[i].match(/avoimet työpaikat/gi) && splitData[i].startsWith("<h1")) {
				// parse out how many jobs there are
				[jobsTotal, jobsNew, ...jobsRest] = splitData[i + 2].match(/(?<=<b>)(\d+\s*\d+)/g).map(elem => parseInt(elem));
			}
		}
	}

	// loop through the data and find all elems containing the search results
	for (let i = 0; i < splitData.length; i++) {
		if (splitData[i].match(/gtm-search-result/gi)) {
			// check if there is a "katso" value on the one after the match
			if (splitData[i + 1].match(/katso|uusi|hae/i)) splitData.splice(i, 1);

			// parse out the data wanted for the job
			let jobData = {
				company: splitData[i + 1].match(/(?<=data-company=")(.*?)"/)[1],
				name: splitData[i + 1].match(/(?<=>).*(?=<)/)[0],
				link: `https://duunitori.fi${splitData[i + 1].match(/(?<=href=")(.*?)"/)[1]}`
			};

			// push the job data to the allJobs array for use later
			allJobs.push(jobData);
		}
	}
}

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
				resolve({message: `Server responded with code: ${res.statusCode}`, status: "problem", statusCode: res.statusCode});
			}

			let data = "";

			// on data respose add to the data variable, on end response resolve the promise with the data and an "ok" status
			res.on("data", (chunk) => { data += chunk; }).on("end", () => { resolve({data: data, status: "ok"}); });
		}).on("error", (err) => { console.log(err); });
	});
}
