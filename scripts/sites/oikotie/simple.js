import { getJobCount, getJobsFromList } from "./../../helperFunctions.js";

export default async function main() {
    // variable for the url and it's search params
    let urlAndSearch = {
        url: "https://tyopaikat.oikotie.fi",
        endpoint: "tyopaikat",
        queryParams: {
            hakusana: "software developer",
        }
    }

    // get the job count from a page, with the object having the details
    let jobCounts = await getJobCount(urlAndSearch, {
        element: "span",
        specialText: "hakutulokset",
        jobsPerPage: 25
    });

    console.log(jobCounts);

    let promises = []

    for (let page = 1; page <= jobCounts.pagesTotal; page++) {
        urlAndSearch.queryParams.page = page;
        console.log("getting page: " + page);

        promises.push(getJobsFromList(urlAndSearch, {
            element: "div",
            specialSelector: "ad-list-item",
            dataClasses: {
                parent: ".job-box",
                jobTitle: ".job-box__title",
                companyName: "data-company",
                posted: ".job-box__job-posted"
            }
        }));
    }

    let promiseData = await Promise.all(promises);

    console.log(promiseData);
}
