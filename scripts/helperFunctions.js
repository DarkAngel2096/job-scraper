// helper function for API calls
import https from "https";
import axios from "axios";
import querystring from "querystring";
import { JSDOM } from "jsdom";

// function to do an API call to somewhere
async function apiCall(endpoint) {
	// create and return a new promise, this way we can await for the response
	return new Promise((resolve, reject) => {
		// make a GET call to the endpoint (which has the query params already added)
		https.get(endpoint, (res) => {
			// if the response is less than 200, or more than 300 something probably went wrong, catch these
			if (res.statusCode < 200 || res.statusCode > 299) {
				// if one of these was found, resolve this with a message showing the code and a "problem" status
				resolve({message: `Server responded with code: ${res.statusCode}`, status: "problem", statusCode: res.statusCode})
			}

			let data = "";

			// on data respose add to the data variable, on end response resolve the promise with the data and an "ok" status
			res.on("data", (chunk) => { data += chunk; }).on("end", () => { resolve({data: data, status: "ok"}); });
		}).on("error", (err) => { console.log(err); });
	});
}

// function to wait some specific time
function sleepSync (ms) {
	const end = new Date().getTime() + ms;
	while (new Date().getTime() < end) { /* do nothing */ }
}

// function to create a URL from a base url bit and all the params
async function createUrl (baseUrl, params) {
	return `${baseUrl}?${querystring.stringify(params)}`
}


// function to do async calls with Axios, with inputting the baseURL and the query params in 2 variables in
const axiosCall = async (url, queryParams) => {
	// Combine base URL and query params
	const fullUrl = `${url}?${new URLSearchParams(queryParams).toString()}`;

	console.log(fullUrl);

	// Make API call and return response data
	try {
		const response = await axios.get(fullUrl);
		return response.data;
	} catch (error) {
		throw new Error(`API call failed: ${error.message}`);
	}
};

// function to get the job count from the site
const getJobCount = async ({ url, endpoint, queryParams }, { element, specialText, hasNew = false, jobsPerPage = 20 }) => {
    // combine base URL and query params
    const fullUrl = `${url}/${endpoint}?${new URLSearchParams(queryParams).toString()}`;

    // get the JSDOM document variable
    const pageDom = await JSDOM.fromURL(fullUrl);

    // search all elems fitting the "element" variable
    const foundElems = pageDom.window.document.querySelectorAll(element);

    // use Array.from() to convert the NodeList to an array and filter for elements that contain the special text
    const matchingElements = Array.from(foundElems).filter(elem => elem?.textContent?.toLowerCase().includes(specialText.toLowerCase()));

    // get the string that contains the job counts, removing any newlines and trimming it
    const jobCountString = matchingElements?.shift()?.textContent.replace(/\r?\n|\r/g, "").trim();

    // extract the total number of jobs and new jobs count (if hasNew is true) from the job count string using regex
    const [jobsTotal, newJobsCount] = jobCountString.match(/\d+/g).map(Number);

    // create the return object, and return it
    const returnObject = {
        jobsTotal,
        newJobs: hasNew ? newJobsCount : undefined,
        pagesTotal: Math.ceil(jobsTotal / jobsPerPage)
    };
    return returnObject;
};




const getJobsFromList = async ({ url, endpoint, queryParams }, { element, specialSelector, dataClasses, linkFull }) => {
	// combine base URL and query params
	const fullUrl = `${url}/${endpoint}?${new URLSearchParams(queryParams).toString()}`;
	// get the JSDOM document variable
    const pageDom = await JSDOM.fromURL(fullUrl);

	// build the selector used in the querySelectorAll function to find all the job postings
	const selector = `${element}${specialSelector ? `[class*="${specialSelector}"]` : ""}`

	// search all elems fitting the "element" variable
    const foundElems = pageDom.window.document.querySelectorAll(selector);


	// loop over all the elements found
	for (let foundElem of Array.from(foundElems)) {
		const parentElement = foundElem.closest(dataClasses.parent);
		const titleElement = parentElement.querySelector(dataClasses.jobTitle);
		const postedElement = parentElement.querySelector(dataClasses.posted);
	 	const linkElement = parentElement.querySelector(dataClasses.link);

		let jobDetails = {
			jobTitle: titleElement?.textContent.replace(/\r?\n|\r/g, "").trim(),
			companyTitle: foundElem.getAttribute(dataClasses.companyName),
			posted: postedElement?.textContent.replace(/\r?\n|\r/g, "").trim(),
			link: linkFull ? linkElement.getAttribute('href') : `${url}${linkElement.getAttribute('href')}`
		}

		console.log(jobDetails);
	}
};


export { apiCall, sleepSync, axiosCall, getJobCount, getJobsFromList }
