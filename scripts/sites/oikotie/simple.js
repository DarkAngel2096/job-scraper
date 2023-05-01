import { getSiteJobCount } from "./../../helperFunctions.js";

export default async function main() {

    let urlAndSearch = {
        url: "https://tyopaikat.oikotie.fi/tyopaikat",
        searchParams: {
            hakusana: "software developer",
        }
    }

    let jobCounts = await getSiteJobCount({
        urlAndSearch: urlAndSearch,
        stringToFind: {
            string: "Hakutulokset",
            jobsPerPage: 25
        }
    });

    console.log(jobCounts);


    return "oikotie simple main";
}
