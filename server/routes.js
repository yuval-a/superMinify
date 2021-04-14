const axios = require('axios');
const { text } = require('express');
const { Worker } = require('worker_threads')
const fs = require('fs');

// An async function that calls a worker thread to run the minifyer
function performMinify(workerData) {
    return new Promise ( (resolve,reject)=> {
        const workerMinify = new Worker('./server/worker-minify.js', { workerData });
        workerMinify.on('message', data=> {
            if (data.status == "error") {
                console.log ("Error in worker-minify: " + data.message);
                reject (data.message);
                return false;
            }
            else if (data.status == "ok") resolve(data);
        });
        workerMinify.on('error', reject);
        workerMinify.on('exit', (code) => {
            if (code !== 0) reject("Error minifying. Please try again.");
        });

    });
}

module.exports = function(app) {

    app.get('/:fileId', (req, res)=> {
        res.render("minified", { fileId: req.params.fileId });
    });

    app.post('/', async (req, res)=> {
        const file = req.files.js_file;
        if (!file) res.json({status:"error", body: "No file found!"});

        // We pass the minify process to a worker thread, as it's a heavy process and can block the event loop.
        const workerMinifyData = {
            compilation_level: req.body.optimize_level,
            output_format: "text",
            output_info: "compiled_code",
            js_code: file.data.toString('utf8')
        };

        const minifyResponse = 
            await performMinify(workerMinifyData)
            .catch(()=> { 
                return res.status(500);
            });

        if (minifyResponse.status == "error") {
            return res.status(500); 
        }

        res.set('X-File-Id', minifyResponse.fileId);
        res.send(minifyResponse.body);
    });

    app.put('/:fileId', async (req,res)=> {
        const workerMinifyData = {
            compilation_level: "SIMPLE_OPTIMIZATIONS",
            output_format: "text",
            output_info: "compiled_code",
            js_code: req.body.code.toString('utf8'),
            file_id: req.params.fileId
        };

        const minifyResponse = 
            await performMinify(workerMinifyData)
            .catch(error => { 
                return res.status(500).send(error);
            });
        if (minifyResponse.status == "error") {
            return res.status(500).send(minifyResponse.message);
        }
        res.set('X-File-Id', minifyResponse.fileId);
        res.send(minifyResponse.body);
    });

    app.delete('/:fileId', (req, res)=> {
        fs.unlink('./public/generated_js_files/' + req.params.fileId + ".js", error => {
            if (error) {
                return res.status(500).send(error);
            }
        });

        fs.unlink('./public/generated_js_files/' + req.params.fileId + ".min.js", error => {
            if (error) {
                return res.status(500).send(error);
            }
            res.send("ok");
        });
    });
};

