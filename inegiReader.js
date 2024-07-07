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
const dataInJSON = csvToJSON({ filePath: "./denue_inegi_62_Servicios de salud y de asistencia social.csv", separator: "," });

    try {
        // Initialize an array to hold the filtered data
        let filteredData = [];

        // Iterate through the data and filter based on the conditions
        for (let i = 0; i < dataInJSON.length; i++) {
            if (dataInJSON[i].correoelec.length > 0 //ensure an email
                && dataInJSON[i].telefono.length > 0 //ensure a phone number
                && dataInJSON[i].nom_estab.length > 0 //ensure company name
                && (dataInJSON[i].per_ocu.includes('251') 
                || dataInJSON[i].per_ocu.includes('101')
                || dataInJSON[i].per_ocu.includes('51')
                || dataInJSON[i].per_ocu.includes('31')
                || dataInJSON[i].per_ocu.includes('11')) // include if per_ocu contains '251' for the number of employees // 
                ) { 
                // Strip commas from the nombre_act field
                dataInJSON[i].nombre_act = dataInJSON[i].nombre_act.replace(/,/g, '');
                dataInJSON[i].nom_estab = dataInJSON[i].nom_estab.replace(/,/g, '');
                dataInJSON[i].raz_social = dataInJSON[i].raz_social.replace(/,/g, '');
                dataInJSON[i].nombre_act = dataInJSON[i].nombre_act.replace(/,/g, '');
                // Correct character errors in necessary fields
                dataInJSON[i].nom_estab = correctCharacters(dataInJSON[i].nom_estab);
                dataInJSON[i].raz_social = correctCharacters(dataInJSON[i].raz_social);
                dataInJSON[i].nombre_act = correctCharacters(dataInJSON[i].nombre_act);
                dataInJSON[i].entidad = correctCharacters(dataInJSON[i].entidad);
                dataInJSON[i].per_ocu = correctCharacters(dataInJSON[i].per_ocu);
                filteredData.push(dataInJSON[i]);
                //console.log(dataInJSON[i]);
            }
        }

        // Convert the filtered data to CSV format, decide which variables to include in each row
        const csvHeaders = "nom_estab,raz_social,nombre_actividad,codigo_postal,entidad,municipio,fecha_alta,correoelec,telefono,www, no. empleados\n";
        const csvRows = filteredData.map(row => `${row.nom_estab},${row.raz_social},${row.nombre_act},${row.cod_postal},${row.entidad},${row.municipio},${row.fecha_alta},${row.correoelec},${row.telefono},${row.www},${row.per_ocu}`).join("\n");
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

