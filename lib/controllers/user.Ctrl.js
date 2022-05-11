// Users.js
var jwt = require('jsonwebtoken');
var express = require('express');
var nodemailer = require('nodemailer');
var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');
var fs = require('fs');
var app = express();
var mailer = require('../config/mailer.config');
var env = require('../config/env');
var moment = require('moment');

app.set('superSecret', env.jwt_sec); // secret variable

var verificationObject = [{}];

function getvaluesinObject(passedval) {
    var charindex = passedval.indexOf("=");
    var strindex = passedval.length;
    var field = passedval.substring(0, charindex).trim();
    var value = passedval.substring(charindex + 1, strindex);

    verificationObject[0][field] = value.trim();
};

function generaterandomPassword() {
    var passwordtxt = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" + new Date();
    for (var i = 0; i < 6; i++) {
        passwordtxt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    if (passwordtxt.length == 6) {
        //passwordtxt
        return cryptconf.encrypt('321');
    }
}

function sendMail(mailbody) {
    const mailOptions = {
        from: cryptconf.decrypt(env.sendermail), // sender address
        to: mailbody.reciver, // list of receivers
        subject: mailbody.subject, // Subject line
        html: mailbody.content // plain text body
    };


    mailer.transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}


module.exports = {




    AuthenticateUser: function (req, res) {
        connection.acquire(function (err, con) {

            var encpass = cryptconf.encrypt(req.body.password)

            // console.log(encpass);
            con.query("SELECT id,name,firstlogin,role,companyid, locationid from users WHERE mobile =? AND password = ?", [req.body.mobile, encpass], function (err, result) {
                if (err) {
                    console.log('---1', err)
                    res.send({
                        success: false,
                        type: "error",
                        title: "Oops!",
                        message: 'Somthing went wrong, Please try again.'
                    });
                } else {
                    if (result.length > 1 || result.length <= 0) {
                        res.json({
                            success: false,
                            type: "error",
                            title: "Oops!",
                            message: 'Login cridentials does not matched.'
                        });
                    }
                    if (result.length == 1) {
                        if (result[0].role === 'Superadmin') {
                            var sql = "select 'welcome'";
                        } else {
                            var sql = "SELECT status from company WHERE id = " + result[0].companyid;
                        }
                        con.query(sql, function (err, companyapproval) {
                            if (err) {
                                console.log('---2', err)
                                res.send({
                                    success: false,
                                    type: "error",
                                    title: "Oops!",
                                    message: 'Somthing went wrong, Please try again.'
                                });
                            } else {

                                if (result[0].role === 'Superadmin') {
                                    var payload = {
                                        logedinuser: result[0]
                                    }
                                    var token = jwt.sign(payload, app.get('superSecret'), {
                                        expiresIn: 86400 // expires in 24 hours = 86400    -  28800
                                    });

                                    var d = new Date();
                                    d.setTime(d.getTime() + (0.7 * 24 * 60 * 60 * 1000));
                                    var expires = d.toUTCString();

                                    res.cookie('token', token, {
                                        expires: new Date(expires),
                                        httpOnly: true
                                    });
                                    res.send({
                                        success: true,
                                        type: "success",
                                        title: "Welcome!",
                                        message: 'logged in successfully.',
                                        firstlogin: result[0].firstlogin
                                    });
                                } else {
                                    if (companyapproval[0].status === 1) {
                                        res.send({
                                            success: false,
                                            type: "error",
                                            title: "Oops!",
                                            message: 'your company did not approved by superadmin please contact with your vendor for aproval.'
                                        });
                                    } else {
                                        var payload = {
                                            logedinuser: result[0]
                                        }
                                        var token = jwt.sign(payload, app.get('superSecret'), {
                                            expiresIn: 86400 // expires in 24 hours = 86400
                                        });

                                        var d = new Date();
                                        d.setTime(d.getTime() + (0.7 * 24 * 60 * 60 * 1000));
                                        var expires = d.toUTCString();

                                        res.cookie('token', token, {
                                            expires: new Date(expires),
                                            httpOnly: true
                                        });
                                        res.send({
                                            success: true,
                                            type: "success",
                                            title: "Welcome!",
                                            message: 'logged in successfully.',
                                            firstlogin: result[0].firstlogin
                                        });
                                    }
                                }

                            }
                        });
                    }
                }
            });
        });

    },

    AuthenticateUserAuto: function (req, res) {
        connection.acquire(function (err, con) {

            // var encpass = cryptconf.encrypt(req.body.password)

            // console.log(encpass);
            con.query("SELECT id,name,firstlogin,role,companyid, locationid from users WHERE id = ?", [req.body.id], function (err, result) {
                if (err) {
                    console.log('---1', err)
                    res.send({
                        success: false,
                        type: "error",
                        title: "Oops!",
                        message: 'Somthing went wrong, Please try again.'
                    });
                } else {
                    if (result.length > 1 || result.length <= 0) {
                        res.json({
                            success: false,
                            type: "error",
                            title: "Oops!",
                            message: 'Login cridentials does not matched.'
                        });
                    }
                    if (result.length == 1) {
                        if (result[0].role === 'Superadmin') {
                            var sql = "select 'welcome'";
                        } else {
                            var sql = "SELECT status from company WHERE id = " + result[0].companyid;
                        }
                        con.query(sql, function (err, companyapproval) {
                            if (err) {
                                console.log('---2', err)
                                res.send({
                                    success: false,
                                    type: "error",
                                    title: "Oops!",
                                    message: 'Somthing went wrong, Please try again.'
                                });
                            } else {

                                if (result[0].role === 'Superadmin') {
                                    var payload = {
                                        logedinuser: result[0]
                                    }
                                    var token = jwt.sign(payload, app.get('superSecret'), {
                                        expiresIn: 86400 // expires in 24 hours = 86400    -  28800
                                    });

                                    var d = new Date();
                                    d.setTime(d.getTime() + (0.7 * 24 * 60 * 60 * 1000));
                                    var expires = d.toUTCString();

                                    res.cookie('token', token, {
                                        expires: new Date(expires),
                                        httpOnly: true
                                    });
                                    res.send({
                                        success: true,
                                        type: "success",
                                        title: "Welcome!",
                                        message: 'logged in successfully.',
                                        firstlogin: result[0].firstlogin
                                    });
                                } else {
                                    if (companyapproval[0].status === 1) {
                                        res.send({
                                            success: false,
                                            type: "error",
                                            title: "Oops!",
                                            message: 'your company did not approved by superadmin please contact with your vendor for aproval.'
                                        });
                                    } else {
                                        var payload = {
                                            logedinuser: result[0]
                                        }
                                        var token = jwt.sign(payload, app.get('superSecret'), {
                                            expiresIn: 86400 // expires in 24 hours = 86400
                                        });

                                        var d = new Date();
                                        d.setTime(d.getTime() + (0.7 * 24 * 60 * 60 * 1000));
                                        var expires = d.toUTCString();

                                        res.cookie('token', token, {
                                            expires: new Date(expires),
                                            httpOnly: true
                                        });
                                        res.send({
                                            success: true,
                                            type: "success",
                                            title: "Welcome!",
                                            message: 'logged in successfully.',
                                            firstlogin: result[0].firstlogin
                                        });
                                    }
                                }

                            }
                        });
                    }
                }
            });
        });

    },

    getSession: function (req, res) {
        if (req.decoded && req.decoded.success == true) {
            res.send(req.decoded.logedinuser);
        } else {
            res.send({
                message: 'Unauthorized'
            });
        }
    },

    SignOut: function (req, res) {

    },

    SetNewPassword: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {
                if (req.Loggedinuser.forgotpassword) {
                    var isforgot = 1;
                    res.clearCookie('forgotpassword');
                } else {
                    var isforgot = 0;
                }

                var encpass = cryptconf.encrypt(req.body[0].password)

                con.query("UPDATE users SET password = ?,firstlogin = 1 WHERE id = " + req.decoded.logedinuser.id, [encpass], function (err, result) {
                    if (err) {
                        res.send({
                            status: false,
                            type: "error",
                            title: "Oops!",
                            message: 'Something went wrong,Please try again',

                        });
                    } else {
                        res.send({
                            status: true,
                            type: "success",
                            title: "Done!",
                            message: 'Password updated successfully.',
                            forgotpassword: isforgot
                        });

                    }
                });
            });
        }
    },

    ForgotPassword: function (req, res) {
        connection.acquire(function (err, con) {
            con.query("SELECT id,email from users WHERE email = ?", [req.body.email], function (err, result) {
                if (err) {
                    res.send({
                        success: false,
                        type: "error",
                        title: "Oops!",
                        message: 'Somthing went wrong, Please try again.'
                    });
                    mongoose.disconnect();
                } else {

                    if (result.length > 1 || result.length <= 0) {
                        res.json({
                            success: false,
                            type: "error",
                            title: "Oops!",
                            message: 'Details does not matched.'
                        });
                    }
                    if (result.length == 1) {
                        var d = new Date();
                        d.setTime(d.getTime() + (0.1 * 24 * 60 * 60 * 1000));
                        var expires = d.toUTCString();

                        var otp = Math.floor(100000 + Math.random() * 900000);
                        var sentotp = cryptconf.encrypt(String(otp));
                        var userid = String(result[0].id);

                        res.cookie('otp', sentotp, {
                            expires: new Date(expires),
                            httpOnly: true
                        });

                        res.cookie('forgotpassword', 1, {
                            expires: new Date(expires),
                            httpOnly: true
                        });


                        var payload = {
                            logedinuser: result[0]
                        }
                        var token = jwt.sign(payload, app.get('superSecret'), {
                            expiresIn: 28800 // expires in 24 hours = 86400
                        });

                        var d = new Date();
                        d.setTime(d.getTime() + (0.7 * 24 * 60 * 60 * 1000));
                        var expires = d.toUTCString();

                        res.cookie('token', token, {
                            expires: new Date(expires),
                            httpOnly: true
                        });


                        const mailOptions = {
                            from: cryptconf.decrypt(env.sendermail), // sender address
                            to: result[0].email, // list of receivers
                            subject: 'Forgot Password', // Subject line
                            html: '<h1 style="font-weight:bold;text-align:center;">' + otp + '</h1> <br> <p>Please enter it for reset your password for CS portal.<br> This OTP is valid for 10 minuts. <br><br><br> <div style="float:left;text-align:left;">Thanks, <br> Admin <br> (CS Pvt. Ltd.)</div></p>' // plain text body
                        };
                        mailer.transporter.sendMail(mailOptions, function (err, info) {
                            if (err) {
                                console.log(err)
                            } else {
                                res.send({
                                    success: true,
                                    type: "success",
                                    title: "Sent!",
                                    message: 'OTP sent to your registered mobile number.'

                                });
                            }
                        });


                    }
                }
            });
        });
    },

    verifyOTP: function (req, res) {
        var cookies = req.headers.cookie.split(';', 5);
        cookies.map(function (value) {
            getvaluesinObject(value)
        });

        var recievedotp = cryptconf.encrypt(String(req.params.otp))
        if (recievedotp === verificationObject[0].otp) {
            res.clearCookie('otp', {
                path: '/'
            });
            res.send({
                status: 0
            });
        } else {
            res.send({
                status: 1
            });
        }
    },

    ResetPassword: function (req, res) {
        if (req.headers.cookie) {
            var cookies = req.headers.cookie.split(';', 5);
            cookies.map(function (value) {
                getvaluesinObject(value)
            });
            if (verificationObject[0].id) {

                if (err) {
                    res.send({
                        status: 1,
                        message: 'Somthing went wrong, Please try again!'
                    });
                } else {
                    res.send({
                        status: 0,
                        message: 'Password updated successfully, Thank you!'
                    });
                }

            } else {
                res.send({
                    status: 1,
                    message: 'Somthing went wrong, Please generate OTP again'
                });
            }
        } else {
            res.send({
                status: 1,
                message: 'Somthing went wrong, Please generate OTP again'
            });
        }
    },

    VerifyCompanyEmail: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {
                if (req.body.id) {
                    var appdenquery = ' AND companyid != ' + req.body.id + '';
                } else {
                    var appdenquery = ''
                }
                con.query('SELECT COUNT(*) as emailexist FROM users WHERE email =?' + appdenquery, [req.body.email], function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send({
                            status: 1,
                            message: "Something went wrong"
                        })
                    } else {
                        res.send({
                            result
                        })
                    }
                });
                con.release();
            });
        }
    },

    VerifyCompanyMobile: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.body.id) {
                    var appdenquery = ' WHERE companyid != ' + req.body.id + '';
                } else {
                    var appdenquery = ''
                }
                con.query('SELECT (SELECT COUNT(*) FROM company WHERE mobile =? OR altmobile =?) AS mobileexist, (SELECT COUNT(*) FROM company WHERE mobile =? OR altmobile =?) AS altmobileexist from company ' + appdenquery, [req.body.mobile, req.body.mobile, req.body.altmobile, req.body.altmobile], function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send({
                            status: 1,
                            message: "Something went wrong"
                        })
                    } else {
                        res.send({
                            result
                        })
                    }
                });
                con.release();
            });
        }
    },

    VerifyCompanyLandline: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.body.id) {
                    var appdenquery = ' WHERE companyid != ' + req.body.id + '';
                } else {
                    var appdenquery = ''
                }
                con.query('SELECT (SELECT COUNT(*) FROM company WHERE landline =? OR altlandline =?) AS landlineexist, (SELECT COUNT(*) FROM company WHERE landline =? OR altlandline =?) AS altlandlineexist from company ' + appdenquery, [req.body.landline, req.body.landline, req.body.altlandline, req.body.altlandline], function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send({
                            status: 1,
                            message: "Something went wrong"
                        })
                    } else {
                        res.send({
                            result
                        })
                    }
                });
                con.release();
            });
        }
    },

    SaveCompanyDetails: function (req, res) {
        if (req.decoded.success == true) {
            if (req.file) {
                req.body.CompanyDetails.logo = req.file ? req.file.filename : '';
            }
            if (req.body.CompanyDetails.logo != '' || req.body.CompanyDetails.logo != null) {
                req.body.CompanyDetails.logo = req.body.CompanyDetails.logo;
            }

            req.body.CompanyDetails.createdby = req.decoded.logedinuser.id;
            connection.acquire(function (err, con) {
                if (!req.body.CompanyDetails.id) {
                    con.query("INSERT INTO `company` set ?", req.body.CompanyDetails, function (err, result) {
                        if (err) {
                            console.log(err)
                            try {
                                fs.unlinkSync(req.file.path);
                                console.log('successfully deleted /tmp/hello');
                            } catch (err) {
                                // handle the error
                            }
                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                            con.release();
                        } else {


                            var password = generaterandomPassword();
                            var sql2 = 'INSERT INTO `users`(`name`, `email`, `mobile`, `role`, `password`, `createdby`, `companyid`) VALUES (?,?,?,"Admin","' + password + '",' + req.decoded.logedinuser.id + ', ' + result.insertId + ')';

                            con.query(sql2, [req.body.CompanyDetails.owner, req.body.CompanyDetails.email, req.body.CompanyDetails.mobile], function (err, result) {
                                if (err) {

                                    con.query('DELETE FROM `company` WHERE `id` = ' + result.insertId, function (err, result) {
                                        if (err) {

                                        } else {
                                            res.send({
                                                status: 1,
                                                type: "error",
                                                title: "Oops!",
                                                message: "Something went wrong, Please try again."
                                            });
                                        }
                                    });
                                } else {
                                    {
                                        var mailbody = {
                                            reciver: req.body.CompanyDetails.email,
                                            subject: "One Time Password",
                                            content: 'Dear ' + req.body.CompanyDetails.owner + '<br><br><br><h1 style="font-weight:bold;text-align:center;">' + cryptconf.decrypt(password) + '</h1> <br> <p>enter this as a  password for the app.<br><br><br><br> <div style="float:left;text-align:left;">Thanks, <br> Admin <br> (L.N. software Pvt. Ltd.)</div></p>' // plain text body
                                        }
                                        sendMail(mailbody)
                                    }

                                    res.send({
                                        status: 0,
                                        type: "success",
                                        title: "Done!",
                                        message: "Record inserted successfully."
                                    });
                                }
                            });


                            con.release();
                        }
                    });
                }
                if (req.body.CompanyDetails.id) {

                    if (req.body.CompanyDetails.$hashKey) {
                        delete req.body.CompanyDetails.$hashKey;
                    }

                    req.body.CompanyDetails.createddate = moment(req.body.createddate).format("YYYY-MM-DD HH:mm:ss");

                    con.query("UPDATE `company` set ? WHERE id = ?", [req.body.CompanyDetails, req.body.CompanyDetails.id], function (err, result) {
                        if (err) {
                            console.log(err)
                            try {
                                fs.unlinkSync(req.file.path);
                                console.log('successfully deleted /tmp/hello');
                            } catch (err) {
                                // handle the error
                            }
                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                            con.release();
                        } else {

                            var sql2 = 'UPDATE `users` SET `name`=?,`email`=?,`mobile`=? WHERE  `companyid`= ? AND role = "Admin" ORDER BY id ASC LIMIT 1';
                            con.query(sql2, [req.body.CompanyDetails.owner, req.body.CompanyDetails.email, req.body.CompanyDetails.mobile, req.body.CompanyDetails.id], function (err, result) {
                                if (err) {
                                    console.log(err)
                                } else {

                                }
                            });



                            res.send({
                                status: 0,
                                type: "success",
                                title: "Done!",
                                message: "Record updated successfully."
                            });
                            con.release();
                        }
                    });
                }
            });
        }
    },

    getCompanyList: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                con.query('SELECT * FROM company  ORDER BY id DESC', function (err, result) {
                    if (err) {
                        res.send({
                            status: 1,
                            message: "Something went wrong"
                        })
                    } else {
                        res.send({
                            companyList: result
                        })
                    }
                });
                con.release();
            });
        }
    },

    deleteCompanyDetails: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                con.query('UPDATE `company` set status= (CASE WHEN status = 0 THEN 1 ELSE 0 END) WHERE id = ' + req.params.companyid, function (err, result) {
                    if (err) {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: ""
                        });
                    }
                });
                con.release();
            });
        }
    },

    getCompanyDetails: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                con.query('SELECT * FROM `company` WHERE `id` = ' + req.decoded.logedinuser.companyid, function (err, result) {
                    if (err) {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            companyDetails: result
                        });
                    }
                });
                con.release();
            });
        }
    },

    getUserProfileData: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                con.query('SELECT * FROM `users` WHERE `id` = ' + req.decoded.logedinuser.id, function (err, result) {
                    if (err) {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            userProfile: result
                        });
                    }
                });
                con.release();
            });
        }
    },
    SignOut: function (req, res) {
        if (req.decoded) {
            if (req.decoded.success == true) {
                res.clearCookie('token');
                res.send({
                    status: true,
                    type: "success",
                    title: "Thank You!",
                    message: 'Successfully Signout'
                });
            } else {
                res.send({
                    status: false,
                    type: "error",
                    title: "Oops!",
                    message: 'Token already expired'
                });
            }
        }
    },

    updateDeviceId: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                con.query('UPDATE users SET users.deviceid = ? WHERE id = ?', [req.body, req.decoded.logedinuser.id], function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Done"
                        });
                    }
                });
                con.release();
            });
        }


    },

    // COMPANY LOCATIONS

    saveCompanyLocations: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {
                var data = []
                if (req.body.id != undefined && req.body.id > 0) {
                    delete req.body.company_name;
                    delete req.body.bool;
                    var query = 'UPDATE company_locations SET ? WHERE id = ?';
                    data.push(req.body);
                    data.push(req.body.id);
                } else {
                    req.body['companyid'] = req.decoded.logedinuser.companyid;
                    req.body['createdby'] = req.decoded.logedinuser.id;
                    var query = 'INSERT INTO company_locations SET ?';
                    data.push(req.body);
                }
                con.query(query, data, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record saved successfully."
                        });
                    }
                });
                con.release();
            });
        }


    },

    getCompanyLocationsList: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.decoded.logedinuser.role != 'Superadmin') {
                    var query = 'SELECT *, (SELECT name FROM `company` WHERE `id` = company_locations.companyid) AS company_name FROM company_locations WHERE company_locations.companyid = ' + req.decoded.logedinuser.companyid;
                } else {
                    var query = 'SELECT *, (SELECT name FROM `company` WHERE `id` = company_locations.companyid) AS company_name FROM company_locations';
                }
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            companyLocationList: result
                        })
                    }
                });
                con.release();
            });
        }


    },

    deleteCompanyLocations: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {


                var query = 'DELETE FROM company_locations WHERE id in (' + req.params.companyid + ')';

                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                });
                con.release();
            });
        }


    },

    // COMPANY LOCATIONS
    // USER DETAILS


    getCompanyLocations: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.decoded.logedinuser.role != 'Superadmin') {
                    var query = 'SELECT id, location_name FROM company_locations WHERE company_locations.companyid = ' + req.decoded.logedinuser.companyid;
                } else {
                    var query = 'SELECT id, location_name FROM company_locations';
                }
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            companyLocations: result
                        })
                    }
                });
                con.release();
            });
        }


    },


    saveUserDetails: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {
                var data = [];
                var savestatus = '';
                if (req.body.id != undefined && req.body.id > 0) {
                    delete req.body.company_name;
                    delete req.body.location_name;
                    delete req.body.bool;
                    var query = 'UPDATE users SET ? WHERE id = ?';
                    data.push(req.body);
                    data.push(req.body.id);
                } else {
                    req.body['companyid'] = req.decoded.logedinuser.companyid;
                    req.body['createdby'] = req.decoded.logedinuser.id;
                    req.body['password'] = generaterandomPassword();
                    req.body['firstlogin'] = 0;
                    var query = 'INSERT INTO users SET ?';
                    data.push(req.body);
                    savestatus = savestatus + 'insert';
                }
                con.query(query, data, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {


                        if (savestatus && savestatus == 'insert') {
                            var mailbody = {
                                reciver: req.body.email,
                                subject: "One Time Password",
                                content: 'Dear ' + req.body.name + '<br><br><br><h1 style="font-weight:bold;text-align:center;">' + cryptconf.decrypt(req.body['password']) + '</h1> <br> <p>enter this as a  password for the app.<br><br><br><br> <div style="float:left;text-align:left;">Thanks, <br> Admin <br> (L.N. software Pvt. Ltd.)</div></p>' // plain text body
                            }
                            sendMail(mailbody)
                        }


                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record saved successfully."
                        });
                    }
                });
                con.release();
            });
        }


    },

    getUsersList: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.decoded.logedinuser.role != 'Superadmin') {
                    var query = 'SELECT *, (SELECT name FROM `company` WHERE `id` = users.companyid) AS company_name,  (SELECT location_name FROM `company_locations` WHERE company_locations.`id` = users.locationid) AS location_name FROM users WHERE users.companyid = ' + req.decoded.logedinuser.companyid;
                } else {
                    var query = 'SELECT *, (SELECT name FROM `company` WHERE `id` = users.companyid) AS company_name,  (SELECT location_name FROM `company_locations` WHERE company_locations.`id` = users.locationid) AS location_name FROM users';
                }
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            UsersList: result
                        })
                    }
                });
                con.release();
            });
        }


    },

    deleteUsers: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {


                var query = 'DELETE FROM users WHERE id in (' + req.params.userid + ')';

                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                });
                con.release();
            });
        }


    },

    // USER DETAILS


    getAquiredParking: function (req, res) {
        if (req.decoded && req.decoded.success == true) {
            connection.acquire(function (err, con) {
                if (req.body.locationid != undefined && req.body.locationid != null) {
                    var locationid = req.body.locationid;
                } else {
                    var locationid = req.decoded.logedinuser.locationid;
                }

                var query = 'SELECT `id`, customer_id, (SELECT customers.vehical_no FROM customers WHERE customers.id = daily_parking_allocation.customer_id) as vehical_no, (SELECT customers.vehical_type FROM customers WHERE customers.id = daily_parking_allocation.customer_id) as vehical_types,  `allocation_status`,`time_from`,`time_to`,`payment_status` FROM `daily_parking_allocation` WHERE `companyid` = ' + req.decoded.logedinuser.companyid + ' AND `locationid` = ' + locationid;

                if (req.body.bookingdate != undefined && req.body.bookingdate != null && req.body.bookingdate != '') {
                    query = query + ' AND DATE_FORMAT(`createddate`,"%d-$m-$Y") = ' + moment(req.body.bookingdate).format("DD-MM-YYYY");
                } else {
                    query = query + ' AND DATE_FORMAT(`createddate`,"%d-$m-$Y") = DATE_FORMAT(CURDATE(),"%d-$m-$Y") ';
                }

                if (req.body.time_from != undefined && req.body.time_from != null && req.body.time_from != '') {
                    query = query + ' AND `time_from` <= ' + moment(req.body.time_from).format("hh:mm:ss");
                }
                if (req.body.time_to != undefined && req.body.time_to != null && req.body.time_to != '') {
                    query = query + ' AND `time_to` <= ' + moment(req.body.time_to).format("hh:mm:ss");
                }

                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            parkingData: result
                        })
                    }
                });
                con.release();
            });
        }



    },

    getLocationParkingCapacity: function (req, res) {
        if (req.decoded && req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.decoded.logedinuser.role != 'Superadmin') {
                    var query = 'SELECT name, id, locationid, (SELECT parking_capacity FROM `company_locations` WHERE company_locations.`id` = users.locationid) AS _parking_capacity FROM users WHERE users.id = ' + req.decoded.logedinuser.id;
                }

                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            capacity: result
                        })
                    }
                });
                con.release();
            });
        }



    },

    getExistingVehicalsNumber: function (req, res) {
        if (req.decoded && req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.decoded.logedinuser.role != 'Superadmin') {
                    var query = 'SELECT  id, vehical_no FROM customers WHERE customers.companyid = ' + req.decoded.logedinuser.companyid + ' AND customers.locationid = ' + req.decoded.logedinuser.locationid;
                }

                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            vehicals: result
                        })
                    }
                });
                con.release();
            });
        }
    },

    getCustomerData: function (req, res) {
        if (req.decoded && req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.decoded.logedinuser.role != 'Superadmin') {
                    var query = 'SELECT * FROM customers WHERE customers.id = ' + req.params.id;
                }

                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            customerDetails: result
                        })
                    }
                });
                con.release();
            });
        }
    },


    saveParkingAllocationDetails: function (req, res) {
        if (req.decoded && req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.body.id != undefined && req.body.id != null) {
                    con.query('UPDATE `daily_parking_allocation` SET `time_to` = ?, `payment_status` = ?, `amount` = ? WHERE id = ?', [new Date(req.body.time_to), req.body.payment_status, req.body.amount,req.body.id], function (err, result) {
                        if (err) {
                            res.send({
                                status: 0,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                        } else {
                            res.send({
                                status: 1,
                                type: "success",
                                title: "Done!",
                                message: "Record updated successfully."
                            });
                        }
                    });
                } else {
                    if (typeof req.body.vehical_no == 'object') {

                        con.query('select id from `daily_parking_allocation` WHERE customer_id = ? AND DATE_FORMAT(`createddate`,"%d-$m-$Y") = DATE_FORMAT(CURDATE(),"%d-$m-$Y")', [req.body.vehical_no.id], function (err, result) {
                            if (err) {
                                res.send({
                                    status: 0,
                                    type: "error",
                                    title: "Oops!",
                                    message: "Something went wrong, Please try again."
                                });
                            } else {
                                if (!result || result.length <= 0) {
                                    con.query('INSERT INTO `daily_parking_allocation`(`companyid`, `locationid`, `customer_id`, `allocation_status`, `time_from`, `time_to`, `payment_status`, `amount`, `status`, `createdby`) VALUES (?,?,?,0,?,?,?,?,0,?)', [req.decoded.logedinuser.companyid, req.decoded.logedinuser.locationid, req.body.vehical_no.id, new Date(), new Date(req.body.time_to), req.body.payment_status, req.body.amount, req.decoded.logedinuser.id], function (err, result) {
                                        if (err) {
                                            res.send({
                                                status: 0,
                                                type: "error",
                                                title: "Oops!",
                                                message: "Something went wrong, Please try again."
                                            });
                                        } else {
                                            res.send({
                                                status: 1,
                                                type: "success",
                                                title: "Done!",
                                                message: "Record saved successfully."
                                            });
                                        }
                                    });
                                } else {
                                    res.send({
                                        status: 0,
                                        type: "error",
                                        title: "Dupilcate!",
                                        message: "Record already exist."
                                    });
                                }
                            }
                        });
                    } else {

                        con.query('SELECT id FROM `customers` WHERE `companyid` = ? AND `locationid` = ? AND `vehical_no` = ?', [req.decoded.logedinuser.companyid, req.decoded.logedinuser.locationid, req.body.vehical_no], function (err, result) {
                            if (err) {} else {
                                if (result && result.length > 0) {
                                    res.send({
                                        status: 0,
                                        type: "error",
                                        title: "Oops!",
                                        message: "Customer's record already exist"
                                    });
                                } else {
                                    con.query('INSERT INTO `customers`(`companyid`, `locationid`, `vehical_type`, `customer_name`, `mobile`, `email`, `vehical_no`, `time_from`, `time_to`, `status`,  `createdby`) VALUES (?,?,?,?,?,?,?,?,?,0,?)', [req.decoded.logedinuser.companyid, req.decoded.logedinuser.locationid, req.body.vehical_type, req.body.customer_name, req.body.mobile, req.body.email, req.body.vehical_no, new Date(), new Date(req.body.time_to), req.decoded.logedinuser.id], function (err, result) {
                                        if (err) {
                                            console.log(err)
                                            res.send({
                                                status: 0,
                                                type: "error",
                                                title: "Oops!",
                                                message: "Something went wrong, Please try again."
                                            });
                                        } else {
                                            con.query('INSERT INTO `daily_parking_allocation`(`companyid`, `locationid`, `customer_id`, `allocation_status`, `time_from`, `time_to`, `payment_status`, `amount`, `status`, `createdby`) VALUES (?,?,?,0,?,?,?,?,0,?)', [req.decoded.logedinuser.companyid, req.decoded.logedinuser.locationid, result.insertId, new Date(), new Date(req.body.time_to), req.body.payment_status, req.body.amount, req.decoded.logedinuser.id], function (err, result) {
                                                if (err) {
                                                    console.log(err)
                                                    res.send({
                                                        status: 0,
                                                        type: "error",
                                                        title: "Oops!",
                                                        message: "Something went wrong, Please try again."
                                                    });
                                                } else {
                                                    res.send({
                                                        status: 1,
                                                        type: "success",
                                                        title: "Done!",
                                                        message: "Record saved successfully."
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });


                    }
                }
            });
        }
    },

// CUSTOMER DETAILS

saveCustomerDetails: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {
                var data = [];
                var savestatus = '';
                if (req.body.id != undefined && req.body.id > 0) {
                    delete req.body.company_name;
                    delete req.body.location_name;
                    delete req.body.bool;
                    var query = 'UPDATE customers SET ? WHERE id = ?';
                    data.push(req.body);
                    data.push(req.body.id);
                } else {
                    req.body['companyid'] = req.decoded.logedinuser.companyid;
                    req.body['locationid'] = req.decoded.logedinuser.locationid;
                    req.body['createdby'] = req.decoded.logedinuser.id;
                    var query = 'INSERT INTO customers SET ?';
                    data.push(req.body);
                    savestatus = savestatus + 'insert';
                }
                con.query(query, data, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {

                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record saved successfully."
                        });
                    }
                });
                con.release();
            });
        }


    },

    getCustomersList: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {

                if (req.decoded.logedinuser.role != 'Superadmin') {
                    var query = 'SELECT *, (SELECT name FROM `company` WHERE `id` = customers.companyid) AS company_name,  (SELECT location_name FROM `company_locations` WHERE company_locations.`id` = customers.locationid) AS location_name FROM customers WHERE customers.companyid = ' + req.decoded.logedinuser.companyid;
                } else {
                    var query = 'SELECT *, (SELECT name FROM `company` WHERE `id` = customers.companyid) AS company_name,  (SELECT location_name FROM `company_locations` WHERE company_locations.`id` = customers.locationid) AS location_name FROM customers';
                }
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            CustomersList: result
                        })
                    }
                });
                con.release();
            });
        }


    },

    deleteCustomers: function (req, res) {
        if (req.decoded.success == true) {
            connection.acquire(function (err, con) {


                var query = 'DELETE FROM customers WHERE id in (' + req.params.ids + ')';

                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    } else {
                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                });
                con.release();
            });
        }


    },

    // CUSTOMER DETAILS



};
