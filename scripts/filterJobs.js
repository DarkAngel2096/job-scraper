// module imports
import fs from "fs";
import { apiCall, sleepSync } from "./helperFunctions.js";

// get start time to figure out how long things took
const startTime = Date.now();

// path to file load
const folderPath = "./outputData";
const fileName = "/allJobsDetails.json";

// check if we have the alljobs file from before
if (!fs.existsSync(folderPath) || !fs.existsSync(folderPath + fileName)) {
	console.log("Missing data from before, run 'npm run searchAll' first.");
	process.exit();
}

// load the json file to memory
const {default: allJobs} = await import(`.${folderPath}${fileName}`, {assert: {type: "json"}});


// variable to keep stuff that i want
let filteredJobs = [];

// loop through all the jobs found
for (let job of allJobs) {
	if (job.description.match(/vähi.{0,50}vuo|yea.{0,50}expe/gi)) continue;
	if (job.description.match(/senior/gi) || job.name.match(/senior/gi)) continue;
	if (!job.description.match(/node/gi)) continue;
	filteredJobs.push(job);
}

console.log(`found total of ${filteredJobs.length} jobs matching filters, from total ${allJobs.length} jobs.`);

let write = true;

if (write) {
	// write the JSON file and log out final message
	fs.writeFileSync("./outputData/filteredJobsDetails.json", JSON.stringify(filteredJobs, null, "\t"));
	console.log(`\nTook: "${Date.now() - startTime}"ms to do everything.\n` +
		`File called "filteredJobsDetails.json" written in outputData having "${filteredJobs.length}" jobs.`);
}
