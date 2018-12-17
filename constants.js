const jsonWebToken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var secretKey = 'sUPerSeCuREKeY&^$^&$^%$^%7782348723t4872t34Ends';


exports.responseFlags = {};
define(exports.responseFlags, 'PARAMETER_MISSING', 100);
define(exports.responseFlags, 'ERROR', 400);
define(exports.responseFlags, 'SUCCESS', 200);
define(exports.responseFlags, 'NOT_FOUND', 404);
define(exports.responseFlags, 'ALREADY_EXISTS', 201);
define(exports.responseFlags, 'ACTION_COMPLETE', 200);
define(exports.responseFlags, 'SHOW_ERROR_MESSAGE', 400);
define(exports.responseFlags, 'NO_CARD', 201);


exports.createToken = (dataToCreate) => {
    var token =  jsonWebToken.sign(dataToCreate, secretKey);
    return token;
 
};

exports.bcryptPassword = (passwordToCrypt, callback) => {
    bcrypt.hash(passwordToCrypt, saltRounds, function(err, hash) {
        if(err){
            callback(err);
        }
        else{
            callback(null, hash);
        }
    });
};

exports.comparePassword = (passwordToCompare, hash, callback) => {
    bcrypt.compare(passwordToCompare, hash, function(err, res) {
        if(err){
            callback(err);
        }
        else{
            callback(null,res);
        }
    });
};