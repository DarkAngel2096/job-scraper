// module and file imports
import fs from "fs";

// script start
const scriptStartTime = new Date();
console.log(`Starting the script at: '${scriptStartTime.toLocaleTimeString()}'`);

// get process args
const args = process.argv.slice(2);

// check if the first arg got is "simple", used for just getting the basic details of a job, not the full description etc
let simple = false;
if (args[0].toLowerCase().trim() === "simple") {
    // doinf shift to remove the "simple" arg from the start if found, that way checking for sites later doesn't get messed up
    args.shift();
    simple = true;
}

// read the site dirs found
const sites = fs.readdirSync("./scripts/sites");

// import the files found in a loop
let files = {};
for (let site of sites) {
    // check if any of the args match with the site name, slice used to remove the ".js" from the end
    if (args.length === 0 || (args.length > 0 && args.includes(site.slice(0, -3).toLowerCase().trim()))) {
        files[site] = await import(`./sites/${site}`);
    }
}   // to run a script, do `site.default()` to run it

// loop through the args, checking if a site should be checked through
for (let [siteKey, siteFunction] of Object.entries(files)) {
    console.log("\nsite found: " + siteKey);
    await siteFunction.default(simple);
}


// script end
const scriptEndTime = new Date();
console.log(`\nScript run ended at: '${scriptEndTime.toLocaleTimeString()}', took: '${scriptEndTime - scriptStartTime}ms.'`);
