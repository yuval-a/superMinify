const { workerData, parentPort } = require('worker_threads');
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');

// Use current date timestamp as file Id if not exist
const fileId = workerData.file_id ? workerData.file_id : Date.now();
delete workerData.file_id;

// Closure Compiler API only accepts data as query string
const data = querystring.stringify(workerData);
axios.post('https://closure-compiler.appspot.com/compile', data)
.then (response=> {
    // a string with a single line-feed is returned in case of code syntax error
    if (response.data.length > 1 && /\S/.test(response.data)) {

        // Save the original unminified version of the file
        fs.writeFile('./public/generated_js_files/' + fileId + ".js", workerData.js_code, { flag: 'w+' }, function (error) {
            if (error) { 
                parentPort.postMessage({
                    status: "error",
                    message: error
                });
                return false;
            }

            // Write the minified file
            fs.writeFile('./public/generated_js_files/' + fileId + ".min.js", response.data, { flag: 'w+' }, function (error) {
                if (error) { 
                    parentPort.postMessage({
                        status: "error",
                        message: error
                    });
                    return false;
                }
                parentPort.postMessage({
                    status:"ok",
                    fileId, 
                    body: response.data
                });
            });
        });
    }
    else 
        parentPort.postMessage({
            status: "error",
            message: "Syntax Error"
        });
});
