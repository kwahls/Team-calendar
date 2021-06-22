Min HTML-kod finns i index.html. Om du öppnar HTML-filen direkt i webbläsaren kommer
sannolikt inte objekten från minaPersoner.json och minaEvent.json att läsas in eftersom de
blockeras av webbläsaren och du får sannolikt ett felmeddelande i stil med nedanstående:

main.min.js:1071 Request failed Object
(anonymous) @ main.min.js:1071
minaEvent.json?start=2021-06-21T00%3A00%3A00%2B02%3A00&end=2021-06-26T00%3A00%3A00%2B02%3A00:1 Failed to load resource: net::ERR_FAILED
index.html:1 Access to XMLHttpRequest at 'file:///C:/Users/kaspe/Desktop/Fullcalendar-demo/node_modules/fullcalendar-scheduler/minaPersoner.json?' 
from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension,
chrome-untrusted, https.
minaPersoner.json?:1 Failed to load resource: net::ERR_FAILED

Detta meddelande undviks genom att öppna index.html i exempelvis visual studio code med pluginen Live Server. 



Min Javascript-kod finns i logic.js. Se kommentarer som inleds med "TO DO:" för kommentarer som beskriver vad en server behöver göra för att få saker att fungera.

Min CSS-kod finns i stylesheet.css.

