const http = require('http');
const fileUpload = require('express-fileupload');
const express = require('express');

const app = express();
app.locals.pretty = true;

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/server/views');
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(fileUpload());


require('./server/routes')(app);
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
