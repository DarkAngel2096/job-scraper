import { getSiteJobCount } from "./../../helperFunctions.js";

export default async function main() {

    await getSiteJobCount({
        url: "https://tyopaikat.oikotie.fi/tyopaikat",
        searchParams: {
            hakusana: "software developer",
        },
        stringToFind: {
            string: "Hakutulokset",
            jobsPerPage: 25
        }
    });


    return "oikotie simple main";
}
