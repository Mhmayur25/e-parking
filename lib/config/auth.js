// Security.js


var jwt = require('jsonwebtoken');
var express = require('express');
var cookieParser = require('cookie-parser')
var env = require('./env');
var app = express();

app.set('superSecret', env.jwt_sec); // secret variable

app.use(cookieParser())

module.exports = function (req, res, next) {

    var verificationObject = [{}];

    function getvaluesinObject(passedval) {
        var charindex = passedval.indexOf("=");
        var strindex = passedval.length;
        var field = passedval.substring(0, charindex).trim();
        var value = passedval.substring(charindex + 1, strindex);

        verificationObject[0][field] = value.trim();


    };

	if(req.headers.cookie)
	{
			var cookies = req.headers.cookie.split(';', 20);
			cookies.map(function (value) {
				getvaluesinObject(value)
			});
	
    // check header or url parameters or post parameters for token
    var token = verificationObject[0].token || req.headers['x-access-token'];
    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                res.send({status:401, message: "Unauthorized"});
            } else {
                decoded.success = true
                req.Loggedinuser = verificationObject[0];
                req.decoded = decoded;
            }
        });

    } else {

        // if there is no token
        // return an error
        res.send({status:401, message: "Unauthorized"});
    
    }
}
else{
    res.send({status:401, message: "Unauthorized"});
}
};