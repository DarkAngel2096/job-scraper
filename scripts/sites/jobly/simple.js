import { getSiteJobCount } from "./../../helperFunctions.js";

export default async function main() {

    let urlAndSearch = {
        url: "https://www.jobly.fi/tyopaikat",
        searchParams: {
            search: "software developer",
            job_geo_location: "uusimaa, suomi",
            country: "suomi",
            administrative_area_level_1: "uusimaa"
        }
    }

    let jobCounts = await getSiteJobCount({
        urlAndSearch: urlAndSearch,
        stringToFind: {
            string: "search-result-header",
            startsWith: "<div",
            jobsPerPage: 20
        }
    });

    console.log(jobCounts);


    return "jobly simple main";
}
