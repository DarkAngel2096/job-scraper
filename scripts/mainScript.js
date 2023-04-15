// module and file imports
import fs from "fs";


// script start
console.log(`Starting the script at: '${new Date().toLocaleTimeString()}'`);

// get process args
const args = process.argv.slice(2);
console.log(args);

// read the site dirs found
const sites = fs.readdirSync("./scripts/sites");
console.log(sites);

// import the files found in a loop
let files = {
    simple: {},
    full: {}
};

for (let site of sites) {
    // check if simple file exists and import it if it does
    if (fs.existsSync(`./scripts/sites/${site}/simple.js`)) {
        files.simple[site] = await import(`./sites/${site}/simple.js`);
    } else console.log(`simple for "${site}" is missing`);

    // check if full file exists and import it if it does
    if (fs.existsSync(`./scripts/sites/${site}/full.js`)) {
        files.full[site] = await import(`./sites/${site}/full.js`);
    } else console.log(`full for "${site}" is missing`);
}
// to run a script, do `site.default()` to run it


// loop through the args, checking if a site should be checked through
for (let [siteKey, siteFunction] of Object.entries(files.simple)) {
    console.log(siteKey, siteFunction.default());
}

// loop through the args, checking if a site should be checked through
for (let [siteKey, siteFunction] of Object.entries(files.full)) {
    console.log(siteKey, siteFunction.default());
}









// script end
console.log(`Script run ended at: '${new Date().toLocaleTimeString()}'`);
