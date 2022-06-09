// module imports
import fs from "fs";

// check if we have the alljobs file from before
if (!fs.existsSync("./outputData") || !fs.existsSync("./outputData/allJobsSimple.json")) {
	console.log("Missing data from before, run 'npm run searchAll' first.");
	process.exit();
}

import allJobs from "../outputData/allJobsSimple.json" assert {type: "json"};
console.log(allJobs.length);
