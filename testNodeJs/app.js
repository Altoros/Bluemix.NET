var express = require('express');

var app = express();
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3000);

app.use('/cars', require('./routes/cars'));
app.listen(port, host);
