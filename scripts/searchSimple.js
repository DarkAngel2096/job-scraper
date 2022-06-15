// module imports
import querystring from "querystring";
import fs from "fs";
import { apiCall, sleepSync } from "./helperFunctions.js";

// get start time to figure out how long things took
const startTime = Date.now();

// variables to create the url
const urlBase = "https://duunitori.fi/tyopaikat";

// variables to change to get different results
// both of which should be arrays of strings as input ["string1", "string2", "string3"]
const urlPlace = ["pääkaupunkiseutu"];
const urlSearch = ["software developer", "ohjelmisto kehittäjä"];
const limitSet = false;

// build the full url from the bits
let fullURL = `${urlBase}?${querystring.stringify(
	{
		alue: urlPlace.join(";"),
		haku: urlSearch.join(";"),
		search_also_descr: 1
	})}`;

// variables to hold job count data
let [jobsTotal, jobsNew, jobsRest] = [0, 0, []];
let currentJobNum = 0;

// variable to contain all the jobs
let allJobs = [];

// do the first page call
await parseSearchPage(fullURL, true);

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

// variable for all the promises
let promises = []

console.log("Starting to work on the rest of the pages, hang on...");
// loop through the rest of the pages and parsing those
for (let i = 2; i <= totalPages; i++) {
	promises.push(parseSearchPage(`${fullURL}&sivu=${i}`));

	if (i % 25 == 0) {
		console.log(`Sleeping for 2sec at: ${i} pages done.`);
		sleepSync(2000);
	}
}

// wait till all promises are done, continue after that
await Promise.all(promises);

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
async function parseSearchPage (url = "", firstPage = false) {
	// do the api call
	const apiData = await apiCall(url);

	// check if call ok
	if (apiData.status == "problem") {
		console.log(`Found some issues with api call: "${apiData.message}"`);
		return;
	}

	// to start with split the data got by newlines, map through it trimming things and removing empty lines
	const splitData = apiData.data.split("\n").map(elem => elem.trim()).filter(elem => elem.length > 0);

	// if it's the first page, parse the job totals
	if (firstPage) {
		// use findIndex to find a specific element
		let openIndex = splitData.findIndex(elem => elem.match(/avoimet työpaikat/gi) && elem.startsWith("<h1"));
		// parse out how many jobs there are
		[jobsTotal, jobsNew, ...jobsRest] = splitData[openIndex + 2].match(/(?<=<b>)(\d+\s*\d+)/g).map(elem => parseInt(elem));
	}

	// use .map() to find the index where search results start and filter with strings to remove not founds
	let searchIndex = splitData.map((elem, i) => elem.match(/gtm-search-result/gi) ? i : "").filter(String);

	if (searchIndex.length > 0) {
		searchIndex.forEach(elem => parseJob(splitData.slice(elem, elem + 40)));
	}
}

// helper function for parsing data
function parseJob (data) {
	// find the index of the bit with data-company
	let baseDataIndex = data.findIndex(elem => elem.match(/data-company/i));

	// create the base object
	let jobData = {
		company: data[baseDataIndex].match(/(?<=data-company=")(.*?)"/)[1],
		name: data[baseDataIndex].match(/(?<=>).*(?=<)/)[0],
		link: `https://duunitori.fi${data[baseDataIndex].match(/(?<=href=")(.*?)"/)[1]}`,
	};

	// get date when posted
	jobData.posted = data[data.findIndex(elem => elem.match(/posted/i))].match(/(?<=julkaistu )\d+.\d+./i)[0];

	// add the data to the allJobs array
	allJobs.push(jobData);
}
