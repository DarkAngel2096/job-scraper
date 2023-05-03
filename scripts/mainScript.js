// module and file imports
import fs from "fs";

// script start
const scriptStartTime = new Date();
console.log(`Starting the script at: '${scriptStartTime.toLocaleTimeString()}'`);

// get process args
const args = process.argv.slice(2);
//console.log(args);

// read the site dirs found
const sites = fs.readdirSync("./scripts/sites");
//console.log(sites);

// import the files found in a loop
let files = {
    simple: {},
    full: {}
};

for (let site of sites) {
    // check if simple file exists and import it if it does
    if (fs.existsSync(`./scripts/sites/${site}/simple.js`)) {
        // check if any of the args match with the site name
        if (args.length === 0 || (args.length > 0 && args.includes(site.toLowerCase().trim()))) {
            files.simple[site] = await import(`./sites/${site}/simple.js`);
        }
    }

    // check if full file exists and import it if it does
    if (fs.existsSync(`./scripts/sites/${site}/full.js`)) {
        // check if any of the args match with the site name
        if (args.length === 0 || (args.length > 0 && args.includes(site.toLowerCase().trim()))) {
            files.full[site] = await import(`./sites/${site}/full.js`);
        }
    }
}
// to run a script, do `site.default()` to run it


// loop through the args, checking if a site should be checked through
for (let [siteKey, siteFunction] of Object.entries(files.simple)) {
    console.log("\nsite found: " + siteKey);
    await siteFunction.default();
}

// loop through the args, checking if a site should be checked through
for (let [siteKey, siteFunction] of Object.entries(files.full)) {
    //console.log(siteKey);
    //await siteFunction.default();
}


// script end
const scriptEndTime = new Date();
console.log(`\nScript run ended at: '${scriptEndTime.toLocaleTimeString()}', took: '${scriptEndTime - scriptStartTime}ms.'`);
