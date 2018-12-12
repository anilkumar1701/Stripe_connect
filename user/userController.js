let commonFunction =  require('../commonFunction');
let responses =  require('../responses');
let service = require('./services');
let _ = require('underscore');
const stripe = require("stripe")('sk_test_wYcl95vQuRtTClEfbmEjJE6p');
const stripePublicKey = require("stripe")('pk_test_lBHsebfROM5GuExOJ7mmt9xb');

module.exports ={
    userRegister  : userRegister,
  
}
async function userRegister(req, res) {
    try {
        console.log("THE REQUEST BODY FOR VENDOR REGISTER IS ",req.body);
        let name = req.body.name;
        let phone_no = req.body.phone_no;
        let email = req.body.email;
        let company = req.body.company;
        let address =  req.body.address;
        let date = new Date();
        let username = req.body.username;
        let res = await checkEmail(req,email);
        if (res.length) {
            return responses.alreadyExists(res, error)
        }
        opts = {
            name : name,
            phone_no   : phone_no,
            email      : email,
            company    : company,
            address    : address,
            username  : username,
            password  : req.body.password,
            
        };
        let result = await vendorService.insertUser(req,opts);
        if(result.affectedRows>0){
            return responses.actionCompleteResponse(res,);
        }
          // action complete response
    } catch (error) {
        return responses.sendError(res,error)     // execute error response 
    }result
};


function checkEmail(req, opts) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM tb_users WHERE email = ?";
        con.query(sql, [email], function (error, result) {
            if (error) {
                return reject(error);
            }
            return resolve(result);
        });
    });
};