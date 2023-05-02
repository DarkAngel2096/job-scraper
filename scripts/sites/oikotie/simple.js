import { getJobCount } from "./../../helperFunctions.js";

export default async function main() {

    let urlAndSearch = {
        url: "https://tyopaikat.oikotie.fi/tyopaikat",
        queryParams: {
            hakusana: "software developer",
        }
    }

    let jobCounts = await getJobCount(urlAndSearch, {
        element: "span",
        specialText: "hakutulokset"
    });

    console.log(jobCounts);


    return "oikotie simple main";
}
