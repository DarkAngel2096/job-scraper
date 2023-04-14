// module and file imports
import fs from "fs";



// script start
console.log(`Starting the script at: '${new Date().toLocaleTimeString()}'`);

// read the "sites" folder and find all the folders within it
const siteDir = fs.readdirSync("./scripts/sites");
console.log(siteDir);

// loop over all the sites found, storing what's found in a variable
for (let site of siteDir) {
    const { func1 } = await import(`./sites/${site}/simple.js`);
}
