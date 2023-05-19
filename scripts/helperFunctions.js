// helper function for API calls
import https from "https";
import axios from "axios";
import querystring from "querystring";
import { JSDOM } from "jsdom";
import moment from "moment";

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

	try {
		// get the JSDOM document variable
		const pageDom = await JSDOM.fromURL(fullUrl);

		console.log(pageDom);

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
		
	} catch (err) {
		console.log(err);
	}
};


// function to get the list of jobs from the web page
const getJobsFromList = async ({ url, endpoint, queryParams }, { element, specialSelector, dataClasses, linkFull }) => {
	// combine base URL and query params
	const fullUrl = `${url}/${endpoint}?${new URLSearchParams(queryParams).toString()}`;

	// get the JSDOM document variable
    const pageDom = await JSDOM.fromURL(fullUrl);

	// build the selector used in the querySelectorAll function to find all the job postings
	const selector = `${element}${specialSelector[0] ? `[class*="${specialSelector[0]}"]` : ""}`

	// search all elems fitting the "element" variable
    const foundElems = pageDom.window.document.querySelectorAll(selector);

	// array to hold each of the jobs found
	let allJobsArray = [];

	// loop over all the elements found
	for (let foundElem of Array.from(foundElems)) {
		// check if we have defined the parent element, or if the query selector is already getting the parent
		if (specialSelector[1]) foundElem = foundElem.closest(specialSelector[1]);

		// variable for holding the data for the job
		let jobDetails = {};

		// loop over all the details to search for the details
		for (let [elem, data] of Object.entries(dataClasses)) {
			// get the data from the element needed, doing some fancy stuff if the data is in an attribute instead of the text content
			jobDetails[elem] = data.length > 1
				? (data[1] == "parent" ? foundElem.getAttribute(data[1]) : foundElem.querySelector(data[0]).getAttribute(data[1]))
				: foundElem.querySelector(data[0]).textContent.replace(/\r?\n|\r/g, "").trim();

			// if we are working on the link element, check if linkFull is ture or false, if false, add url to start
			if (elem == "link" && !linkFull) {
				jobDetails.link = url + jobDetails.link;
			}

			// if we are working on the posted element, use moment to get the date into a format which would be the same
			if (elem == "posted") {
				jobDetails.posted = moment(jobDetails.posted, "DD MM YYYY").format("DD.MM.YYYY");
			}
		}

		// push the job to the total
		allJobsArray.push(jobDetails);
	}

	// and return the array
	return allJobsArray;
};


export { apiCall, sleepSync, axiosCall, getJobCount, getJobsFromList }
