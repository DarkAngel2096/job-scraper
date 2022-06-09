# Duunitori digger
A very simplistic script (combination of two separate) to get all the search results from [Duunitori.fi](https://duunitori.fi) and write those into a  single JSON file to search from.

## How to use
- Check that you have Node v17 or later to make sure things work. Some parts (mainly with detailed search) are using experimental features with Node that are still prone to change.

1. After having cloned the repo, go to `scripts/` and open `searchAll.js`
	- In the file, somewhere near the top are the variables `urlPlace` and `urlSearch`, edit those to fit what you're looking for

2. When that's done, there is a command to run:
	- `npm run searchAll` will run the base script to search all the jobs and the basic info (company name, job name, link) and write said data into `outputData/allJobsSimple.json`

3. If you want the whole detailed job description there is another command:
	- `npm run searchDetail` will run a script that uses the links from the data gathered from step 2, and gets the full job description to write in a separate file `outputData/allJobsDetailed.json`

- If you want to get new data, go back to step 1 and edit the variables again.
- If you want to keep the data from the previous run, rename the files in `outputData/`
