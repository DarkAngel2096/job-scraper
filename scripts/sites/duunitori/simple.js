import { getSiteJobCount } from "./../../helperFunctions.js";

export default async function main() {

    await getSiteJobCount({
        url: "https://duunitori.fi/tyopaikat",
        searchParams: {
            haku: "software developer",
            alue: "pääkaupunkiseutu",
            search_also_descr: 1
        },
        stringToFind: {
            string: "avoimet työpaikat",
            startsWith: "<h1",
            countFoundIn: 2,
            specialNumTag: "(?<=<b>)",
            new: true,
            jobsPerPage: 20
        }
    });


    return "duunitori simple main";
}
