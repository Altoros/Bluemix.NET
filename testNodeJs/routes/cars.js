var ibmdb = require('ibm_db');
var express = require('express');
var router = express.Router();

function findKey(obj, lookup) {
    for (var i in obj) {
        if (typeof (obj[i]) === "object") {
            if (i.toUpperCase().indexOf(lookup) > -1) {
                return i;
            }
            findKey(obj[i], lookup);
        }
    }
    return -1;
}

router.get('/all', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var env = null;
    var key = -1;
    var serviceName = 'SQLDB';

    // Look for an entry in the VCAP_SERVICES environment variable that has 
    // the serviceName string in it
    if (process.env.VCAP_SERVICES) {
        env = JSON.parse(process.env.VCAP_SERVICES);
        key = findKey(env, serviceName);
    }
    // If key is still -1 then there either was no VCAP-SERVICES env variable or it did not contain the serviceName
    if (key === -1) {
        response.end('Error finding VCAP-SERVICES environment variable containing ' + serviceName);
        return;
    }
    // Retrieve the credentials section from the VCAP_Services structure using the key we just found
    var credentials = env[key][0].credentials;
    var dsnString = 'DRIVER={IBM DB2 ODBC DRIVER};DATABASE=' + credentials.db +
        ';UID=' + credentials.username + ';PWD=' + credentials.password +
        ';HOSTNAME=' + credentials.hostname + ';port=50001;PROTOCOL=TCPIP;Security=ssl';

    ibmdb.open(dsnString, function (err, conn) {
        if (err) {
            response.end('error: ' + err.message);
            return;
        } 
        var sqlQuery = 'SELECT Id, Model, Color FROM Cars';
        conn.query(sqlQuery, function (err, data) {
            if (err) {
                response.end('SQL Error: ' + err);
                return;
            }
            res.write(JSON.stringify(data));
            conn.close(function () {
                response.end();
            });
        });
    });
});

module.exports = router;
