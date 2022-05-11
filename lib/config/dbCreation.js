var connection = require('./connection');
var fs = require('fs');
var mysql = require('mysql');
var cryptconf = require('./crypt.config');
var env = require('./env');

 var conn = mysql.createConnection({
    host: cryptconf.decrypt(env.host),
    user: cryptconf.decrypt(env.user),
    password: env.password
}); 

function syncTables()
{
    connection.acquire(function(err,con){
        if (err) {
        throw err;}
        else
        {
        var data = fs.readFileSync('./lib/config/db.json')
        var queries = JSON.parse(data);
        queries.map(function(value){
            con.query(value.Query, function(err) {
            if (err) {
                throw err;}
                else
                {
                    // console.log('databese synced');
                }
            });  
        });
        }
    })
}

module.exports = {
     createDB:function () {
        conn.connect(function (err) {
            if (err) throw err;
            else {
                conn.query("CREATE DATABASE IF NOT EXISTS "+cryptconf.decrypt(env.database), function (err, result) {
                    if (err) throw err;
                    else {
                        syncTables();
                    }
                });
            }
        });
    }, 
}
