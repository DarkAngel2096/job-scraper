// module imports
import fs from "fs";
import { apiCall, sleepSync } from "./helperFunctions.js";

// get start time to figure out how long things took
const startTime = Date.now();

// path to file load
const folderPath = "./outputData";
const fileName = "/allJobsSimple.json";

// check if we have the alljobs file from before
if (!fs.existsSync(folderPath) || !fs.existsSync(folderPath + fileName)) {
	console.log("Missing data from before, run 'npm run searchAll' first.");
	process.exit();
}

// load the json file to memory
const {default: allJobs} = await import(`.${folderPath}${fileName}`, {assert: {type: "json"}});


console.log(`Found: ${allJobs.length} job listings from the file.`);
console.log("Starting to gather all the data for pages, this'll take a while...");
// loop through all the jobs, pausing for 5sec every 50 jobs
for (let i = 0; i < allJobs.length; i++) {
	await getPageDetails(allJobs[i]);

	if (i % 50 === 0 && i !== 0) {
		console.log(`Sleeping for 5sec at: ${i} pages done. With ${Date.now() - startTime}ms from start.`);
		sleepSync(5000);
	}
}

// write the JSON file and log out final message
fs.writeFileSync("./outputData/allJobsDetails.json", JSON.stringify(allJobs, null, "\t"));
console.log(`\nTook: "${Date.now() - startTime}"ms to do everything.\n` +
	`File called "allJobsDetails.json" written in outputData having "${allJobs.length}" jobs.`);


// function to get the data from the page
async function getPageDetails(job) {
	// call the pages to get their data
	const pageData = await apiCall(job.link);

	// check if call ok
	if (pageData.status == "problem") {
		console.log(`Found some issues with api call: "${pageData.message}"`);
		return;
	}

	// split the data with newlines, trim out whitespace and filter out empty things
	const splitPageData = pageData.data.split("\n").map(elem => elem.trim()).filter(elem => elem.length > 0);

	// get the index of where the job description starts and where the apply button is
	const detailsIndex = splitPageData.findIndex(elem => elem.match(/description--jobentry/i));
	const detailsEnd = splitPageData.findIndex(elem => elem.match(/js-jobentry-apply btn--max/i));

	// slice out the details, and remove all html tags
	job.description = splitPageData.slice(detailsIndex, detailsEnd).map(elem => elem.replace(/<.*?>/g, "").trim()).filter(elem => elem.length > 0).join(" ");

	// find the index of where the location data starts
	const locationIndex = splitPageData.findIndex(elem => elem.match(/työpaikan sijainti/i));

	// and split out the location
	if (splitPageData[locationIndex + 4].startsWith("<span>")) {
		job.location = splitPageData[locationIndex + 4].replace(/<.*?>/g, "");
	}
}
