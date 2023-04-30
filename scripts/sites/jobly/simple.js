import { getSiteJobCount } from "./../../helperFunctions.js";

export default async function main() {

    await getSiteJobCount({
        url: "https://www.jobly.fi/tyopaikat",
        searchParams: {
            search: "software developer",
            job_geo_location: "uusimaa, suomi",
            country: "suomi",
            administrative_area_level_1: "uusimaa"
        },
        stringToFind: {
            string: "search-result-header",
            jobsPerPage: 20
        }
    });


    return "oikotie simple main";
}
