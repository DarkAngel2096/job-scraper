import { getJobCount } from "./../../helperFunctions.js";

export default async function main() {

    // variable for the url and it's search params
    let urlAndSearch = {
        url: "https://duunitori.fi/tyopaikat",
        queryParams: {
            haku: "software developer",
            alue: "pääkaupunkiseutu",
            search_also_descr: 1
        }
    }





    // get the job count from a page, with the object having the details
    let jobCounts = await getJobCount(urlAndSearch, {
        element: "h5",
        specialText: "työpaikkaa"
    });

    /*
    stringToFind: {
        string: "avoimet työpaikat",
        startsWith: "<h1",
        countFoundIn: 2,
        specialNumTag: "(?<=<b>)",
        new: true,
        jobsPerPage: 20
    }*/

    console.log(jobCounts);

    // loop over all the pages, getting the jobs from each page
    /*for (let page = 0; page < jobCounts.pagesTotal; page++) {
        await getJobsFromList({
            urlAndSearch: urlAndSearch,
            stringToFind: {
                string: ""
            }
        });

        break;
    }*/


    return "duunitori simple main";
}
