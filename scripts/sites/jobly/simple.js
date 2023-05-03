import { getJobCount, getJobsFromList } from "./../../helperFunctions.js";

export default async function main() {
    // variable for the url and it's search params
    let urlAndSearch = {
        url: "https://www.jobly.fi",
        endpoint: "tyopaikat",
        queryParams: {
            search: "software developer",
            job_geo_location: "uusimaa, suomi",
            country: "suomi",
            administrative_area_level_1: "uusimaa"
        }
    }

    // get the job count from a page, with the object having the details
    let jobCounts = await getJobCount( urlAndSearch, {
        specialText: "haullasi löytyi",
        element: "h1"
    });

    console.log(jobCounts);

    let promises = []

    for (let page = 0; page < jobCounts.pagesTotal; page++) {
        urlAndSearch.queryParams.page = page;
        console.log("getting page: " + page);

        promises.push(await getJobsFromList(urlAndSearch, {
            element: "div",
            specialSelector: "job__content",
            dataClasses: {
                parent: ".node-teaser",
                jobTitle: ".node__title",
                companyName: ".recruiter-company-profile-job-organization",
                posted: ".date",
                link: ".recruiter-job-link"
            },
            linkFull: true
        }));
    }

    let promiseData = await Promise.all(promises);

    console.log(promiseData);
}
