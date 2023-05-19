import { getJobCount, getJobsFromList } from "./../helperFunctions.js";

export default async function main( simple = false ) {
    // variable for the url and it's search params
    let urlAndSearch = {
        url: "https://duunitori.fi",
        endpoint: "tyopaikat",
        queryParams: {
            haku: "software developer",
            alue: "pääkaupunkiseutu",
            search_also_descr: 1
        }
    }

    // get the job count from a page, with the object having the details
    let jobCounts = await getJobCount(urlAndSearch, {
        element: "h5",
        specialText: "työpaikkaa",
        hasNew: true
    });

    console.log(jobCounts);

    let promises = []

    for (let page = 1; page <= jobCounts.pagesTotal; page++) {
        urlAndSearch.queryParams.page = page;
        //console.log("getting page: " + page);

        promises.push(getJobsFromList(urlAndSearch, {
            element: "a",
            specialSelector: ["search-result", ".job-box"],
            dataClasses: {
                jobTitle: [".job-box__title"],
                companyName: [ ".gtm-search-result", "data-company"],
                posted: [".job-box__job-posted"],
                link: [".gtm-search-result", "href"]
            }
        }));
    }

    let promiseData = await Promise.all(promises);

    console.log("got: " + promiseData.flat().length);
    console.log(promiseData.flat()[0]);
}
