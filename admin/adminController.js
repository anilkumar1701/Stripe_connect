let commonFunc = require('../commonFunction');
let responses = require('../responses');
let _ = require('underscore');
const constants = require('../constants');
const async = require('async');
var mysql = require('mysql');
const config = require('config');
const connection = mysql.createConnection(config.get('database_settings'));

exports.adminRegister = (req, res) => {

    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var manData = [name, email,password];
    logging.log(apiReference, {
        EVENT: "Printing the request body and mandata",
        BODY: req.body,
        MANDATA: manData
    });
    if (commonFunc.checkBlank(manData)) {
        //return responses.parameterMissingResponse(res);
        return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
            constants.responseFlags.PARAMETER_MISSING, {});
    }

    async.auto([
        function (cb) {
            let sql = 'SELECT * FROM `tb_admin` WHERE email = ?'
            let params = [email];
            connection.query(sql, params, function (err, resp) {
                if (err) {
                    cb(err);
                }
                else {
                    if (resp.length) {
                        return responses.sendCustomResponse(res, responses.responseMessageCode.ALREADY_EXISTS,
                            constants.responseFlags.ALREADY_EXISTS, {});
                    }
                    else {
                        cb();
                    }
                }
            });
        },
        function (cb) {
            constants.bcryptPassword(password, function (err, resp) {
                if (err) cb(err);
                else {
                    encrypt_pass = resp;
                    cb();
                }
            });
        },
        function (err, cb) {
            let sql = 'INSERT INTO `tb_admin` (`email`,`password`,`name`) VALUES(?,?,?)';
            let params = [email, encrypt_pass, name];
            connection.query(sql, params, function (err, resp) {
                if (err)
                    cb(err);
                else {
                    return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
                        constants.responseFlags.ACTION_COMPLETE, {});
                }
            });
        }
    ], function (error, result) {
        if (error) {
            return responses.sendCustomResponse(res, error,
                constants.responseFlags.SHOW_ERROR_MESSAGE, {});
        }
        return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
            constants.responseFlags.ACTION_COMPLETE, {});
    });
};


exports.adminLogin = (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var access_token;
    var compare_pwd;
    async.auto({
        function(cb) {
            let sql = 'SELECT `email`,`password` FROM `tb_admin` WHERE `email`=?';
            let params = [email];
            connection.query(sql, params, function (err, resp) {
                if (err) {
                    cb(err);
                }
                else {
                    compare_pwd = resp[0].password;
                    cb();
                }
            });
        },
        function(err, cb) {
            constants.comparePassword(password, compare_pwd, function (err, resp) {
                if (err) {
                    cb(err);
                }
                else {
                    if (resp) {
                        cb();
                    }
                    else {
                        return responses.sendCustomResponse(res, error,
                            constants.responseFlags.SHOW_ERROR_MESSAGE, {});
                    }
                }
            });
        },
        function(err, cb) {
            access_token = constants.createToken(email);
            let sql = 'UPDATE `tb_admin` SET `access_token` = ? WHERE `email` = ?';
            let params = [access_token, email];
            connection.query(sql, params, function (err, resp) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, access_token);
                }
            })
        }
    }, function (error, result) {
        if (error) {
            return responses.sendCustomResponse(res, error,
                constants.responseFlags.SHOW_ERROR_MESSAGE, result);
        }
        else {
            return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
                constants.responseFlags.ACTION_COMPLETE, {});

        }
    });
};

exports.adminLogout = (req, res) => {
    var access_token = req.body.access_token;
    var email;
    async.auto({
        function(cb) {
            let sql = 'SELECT * FROM `tb_admin` WHERE `access_token` = ?';
            let params = [access_token];
            connection.query(sql, params, function (err, resp) {
                if (err) {
                    cb(err);
                }
                else if (resp.length) {
                    email = resp[0].email;
                    cb();
                }
                else {
                    return responses.sendCustomResponse(res, responses.responseMessageCode.NOT_FOUND,
                        constants.responseFlags.NOT_FOUND, {});
                }
            });
        },
        function(err, cb) {
            let sql = 'UPDATE `tb_admin` SET `access_token`= null WHERE `email` = ?'
            let params = [email];
            connection.query(sql, params, function (err1, resp) {
                if (err1) {
                    cb(err1);
                }
                else {
                    cb(null, 'User Logout Successfully');
                }
            })
        }
    }, function (error, result) {
        if (error) {
            return responses.sendCustomResponse(res, responses.responseMessageCode.NOT_FOUND,
                constants.responseFlags.NOT_FOUND, {});
        }
        else {
            return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
                constants.responseFlags.ACTION_COMPLETE, {});
        }
    })
}