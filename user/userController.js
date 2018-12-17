let commonFunc = require('../commonFunction');
let responses = require('../responses');
let _ = require('underscore');
const constants = require('../constants')
const async = require('async');
var mysql = require('mysql');
const config = require('config');
const connection = mysql.createConnection(config.get('database_settings'));


exports.userRegister = (req, res) => {

    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var password = req.body.password;
    var date = new Date();

    var manData = [name, email, phone, password];
    if (commonFunc.checkBlank(manData)) {
        return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
            constants.responseFlags.PARAMETER_MISSING, {});
    }

    async.auto([
        function (cb) {
            let sql = 'SELECT * FROM `tb_users` WHERE email = ?'
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
            let sql = 'INSERT INTO `tb_users` (`email`,`password`,`name`,`phone`) VALUES(?,?,?,?)';
            let params = [email, encrypt_pass, name, phone];
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


exports.user_login = (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var access_token;
    var compare_pwd;
    async.auto({
        function(cb) {
            let sql = 'SELECT `email`,`password` FROM `tb_users` WHERE `email`=?';
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
            let sql = 'UPDATE `tb_users` SET `access_token` = ? WHERE `email` = ?';
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

exports.user_logout = (req, res) => {
    var access_token = req.body.access_token;
    var email;
    async.auto({
        function(cb) {
            let sql = 'SELECT * FROM `tb_users` WHERE `access_token` = ?';
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
            let sql = 'UPDATE `tb_users` SET `access_token`= null WHERE `email` = ?'
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
};


exports.createBooking = (req, res) => {
    let access_token = req.body.access_token;
    let item_name = req.body.item_type;
    let price = req.body.price;
    let manData = [access_token, item_name, price];
    if (commonFunc.checkBlank(manData)) {
        return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
            constants.responseFlags.PARAMETER_MISSING, {});
    }

    if(manData){
        async.auto({
            function(cb){
                let sql = 'SELECT * FROM `tb_users` WHERE `access_token` = ?'
                let params = [access_token];
                connection.query(sql, params, function(err, resp){
                    if(err){
                        cb(err);
                    }
                    else{
                      cb(null,result);
                    }
                });
            },
            function(err, cb){
                let sql ="INSERT INTO `tb_jobs`(`quantity`, `payvia`) VALUES (?,?)"
                let params = [quantity,1]
                connection.query(sql, params, function(err1, resp){
                    if(err1){
                        cb(err1);
                    }
                    else{
                        cb(null, resp);
                    }
                })
            },
            function(err, result){
                let job_id = result.insertId;
                sql = "INSERT INTO `tb_booking`(`item_name` `price`, `paymentstatus`,`job_id`) VALUES (?,?,?,?)"
                params = [item_name,price,'PENDING',job_id]
                connection.query(sql, params, function(err1, resp){
                    if(err1){
                        cb(err1);
                    }
                    else{
                        cb(null, "Booking Created SuccessFully");
                    }
                })
            }
        }, function(error, result){
            if(error) {
                return responses.sendCustomResponse(res, responses.responseMessageCode.SHOW_ERROR_MESSAGE,
                    constants.responseFlags.SHOW_ERROR_MESSAGE, {});
            }
            else{
                return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
                    constants.responseFlags.ACTION_COMPLETE, {});
            }
        });
    }else{
        return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
            constants.responseFlags.PARAMETER_MISSING, {});
    }
};




exports.getBooking = (req, res) => {
    let access_token = req.headers.access_token;
    let user;
    async.auto({
        get_user: function(cb){
            let sql = 'SELECT * FROM `tb_users` WHERE `access_token` = ?';
            let params = [access_token];
            connection.query(sql, params, function(err, resp){
                if(err){
                    cb(err);
                }
                else{
                    user = resp[0].email;
                    cb();
                }
            });
        },
        function(err, cb){
            let sql = 'SELECT * FROM `tb_bookings` WHERE `user`= ?';
            let params = [user];
            connection.query(sql,params, function(err1, resp){
                if(err1){
                    cb(err1);
                }
                else{
                    cb(null, resp);
                }
            })
        }
    }, function(error, result){
        if(error) {
            return responses.sendCustomResponse(res, responses.responseMessageCode.SHOW_ERROR_MESSAGE,
                constants.responseFlags.SHOW_ERROR_MESSAGE, {});
        }
        else{
            return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
                constants.responseFlags.ACTION_COMPLETE, result);
        }
    });
};