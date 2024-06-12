
// if you exceed memory see this resource: https://stackoverflow.com/questions/53230823/fatal-error-ineffective-mark-compacts-near-heap-limit-allocation-failed-javas
// run this command if memory exceeded: export NODE_OPTIONS="--max-old-space-size=8192"
// see this resource for the module text to json: https://www.npmjs.com/package/csv-file-to-json

// Import required modules
var fs = require('fs');
const csvToJSON = require("csv-file-to-json");
const replacements = require('./typoReplacements.js'); //import list of typo corrections

// Function to replace common character errors
function correctCharacters(str) {
    // add more replacements as needed in the typoReplacements file

    for (const [wrong, correct] of Object.entries(replacements)) {
        str = str.replace(new RegExp(wrong, 'g'), correct);
    }
    return str;
}

// Convert CSV to JSON -insert file here, should work with crude INEGI data as is. 
const dataInJSON = csvToJSON({ filePath: "./denue_inegi_31-33_.csv", separator: "," });

    try {
        // Initialize an array to hold the filtered data
        let filteredData = [];

        // Iterate through the data and filter based on the conditions
        for (let i = 0; i < dataInJSON.length; i++) {
            if (dataInJSON[i].correoelec.length > 0 && dataInJSON[i].telefono.length > 0 && dataInJSON[i].nom_estab.length > 0) {
                // Strip commas from the nombre_act field
                dataInJSON[i].nombre_act = dataInJSON[i].nombre_act.replace(/,/g, '');
                // Correct character errors in necessary fields
                dataInJSON[i].nom_estab = correctCharacters(dataInJSON[i].nom_estab);
                dataInJSON[i].raz_social = correctCharacters(dataInJSON[i].raz_social);
                dataInJSON[i].nombre_act = correctCharacters(dataInJSON[i].nombre_act);
                filteredData.push(dataInJSON[i]);
                //console.log(dataInJSON[i]);
            }
        }

        // Convert the filtered data to CSV format, decide which variables to include in each row
        const csvHeaders = "nom_estab,raz_social,nombre_actividad,codigo_postal,entidad,municipio,fecha_alta,correoelec,telefono,www\n";
        const csvRows = filteredData.map(row => `${row.nom_estab},${row.raz_social},${row.nombre_act},${row.cod_postal},${row.entidad},${row.municipio},${row.fecha_alta},${row.correoelec},${row.telefono},${row.www}`).join("\n");
        const csvData = csvHeaders + csvRows;

        // Write the CSV data to a file called outputContact.csv in the same folder
        fs.writeFile("outputContact.csv", csvData, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("CSV file has been saved.");
            }
        });
    } catch (e) {
        console.log('Error:', e.stack);
    };

