// module requires
import querystring from "querystring";


// file requires
import { apiCall } from "./APICalls.js";


// variables to create the url
let urlBase = "https://duunitori.fi/tyopaikat";
let urlPlace = "pääkaupunkiseutu";
let urlSearch = "software developer";
let searchPage = 1;

let fullURL = encodeURI(`${urlBase}/${urlPlace}/${urlSearch}?sivu=`);

console.log(fullURL + searchPage);

//let data = await apiCall(url);
//console.log(data);
