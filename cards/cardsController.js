const stripe = require('stripe')("sk_test_yzle9vRHc8IgcQBhonZB68re");
const stripepay = require('stripe')("pk_test_vYQRJHg0qpwGLwXLZ6jRuzIt")
let commonFunc = require('../commonFunction');
let responses = require('../responses');
let _ = require('underscore');
const constants = require('../constants')
const async = require('async');
var mysql = require('mysql');
const config = require('config');
const connection = mysql.createConnection(config.get('database_settings'));


exports.createCard = (req, res) => {
    const card = {
        number:req.body.card_number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvv: req.body.cvv ,
      };
    if (commonFunc.checkBlank(card)) {
        return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
            constants.responseFlags.PARAMETER_MISSING, {});
    }

    if(card){
        async.auto({
            function(cb){
                let sql="SELECT * FROM tb_user WHERE user_id=?"
                let params =[req.body.userid]
                connection.query(sql, params, function(err, resp){
                    if(err){
                        cb(err);
                    }
                    else{
                        stripepay.tokens.create({ card }, (err, cardTokenInfo) => {
                          if (err) {
                               cb(err);
                          } else {
                            stripe.customers.create({source:cardTokenInfo.id,email:"abcd@yopmail.com"},function(err,card){
                  
                               if(err) {
                                   cb(err);
                               }
                               else
                               {
                                   let cardDetails = card;
                                   card_number = cardDetails.sources.data[0].last4;
                                   card_type = cardDetails.sources.data[0].brand;
                                   card_token = cardDetails.sources.data[0].id;
                                   customerStripeId = cardDetails.id;
                                   let sql = "INSERT INTO `customer_card`(`user_id`, `card_number`, `card_type`, `card_token`, `customer_stripe_id`) VALUES (?,?,?,?,?)";
                                   let parms = [req.body.userid,card_number,card_type,card_token,customerStripeId]
                                   connection.query(sql,parms,(err,result)=>{
                                     if(err)
                                     {
                                       cb(err)
                                     }else{
                                       let sql1 ="UPDATE `user` SET `is_accountadded`=? WHERE user_id = ?"
                                       let params =[1,req.body.userid]
                                       connection.query(sql1,params,(err,success)=>{
                                         console.log(err,success,sql1,params);
                                         if(err)
                                         {
                                           cb(err)
                                         }
                                         else{
                                           response={
                                             status:200,
                                             message:"success ",
                                             data:{}
                                           }
                                           cb(null,response)
                                         }
                                       })
                  
                                     }
                                   })
                  
                               }
                           });
                  
                  
                          }
                           });
                      }
                });
            },  
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

exports.getCards = (user,cb) => {
    let sql =" SELECT * FROM tb_cards WHERE user_id =?"
    let params =[user]
    connection.query(sql,params,(err,result)=>{
      if(err)
      {
        cb(err)
      }
      else{
        response={
          status:200,
          message:"success",
          data:{
            cards : result
          }
        }
        cb(response)
      }
    })
  }



  exports.deleteCard = (req, res) => {
    var access_token = req.body.access_token;
    var user;
    async.auto({
        get_user: function (cb) {
            let sql = 'SELECT * FROM `tb_users` WHERE `access_token` = ?';
            let params = [access_token];
            connection.query(sql, params, function (err, resp) {
                if (err) {
                    cb(err);
                }
                else {
                    user = resp[0].email;
                    cb();
                }
            });
        },
    function (err, cb) {
            let sql = 'UPDATE `tb_cards` SET `default` = ? AND `id_deleted` = ?';
            let params = [0, 1];
            connection.query(sql, params, function (err1, resp) {
                if (err1) {
                    cb(err1);
                }
                else {
                    cb(null, "Card deleted successfully..!");;
                }
            })
        }
    }, function (error, result) {
        if (error) {
            return responses.sendCustomResponse(res, responses.responseMessageCode.SHOW_ERROR_MESSAGE,
                constants.responseFlags.SHOW_ERROR_MESSAGE, {});
        }
        else {
            return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
                constants.responseFlags.ACTION_COMPLETE, result);
        }
    });
};


exports.createPayment = (req, res) => {
    
    let bookingId = req.body.data.id;
    let access_token = req.body.access_token;
    let user_id = req.body.user_id;
    let stripe_id;
    let stripe_token;
    let cost;
    let charge;
    async.auto({
        get_user: function (cb) {
            let sql = 'SELECT * FROM `tb_users` WHERE `access_token` = ?';
            let params = [access_token];
            connection.query(sql, params, function (err, resp) {
                if (err) {
                    cb(err);
                }
                else {
                    user = resp[0].email;
                    cb();
                }
            })
        },
       function (err, cb) {
            let sql = 'SELECT * FROM `tb_cards` WHERE `user_id` = ?';
            let params = [user_id];
            connection.query(sql, params, function (err1, resp) {
                if (err1) {
                    cb(err1);
                }
                else if (resp.length) {
                    stripe_id = resp[0].stripe_id;
                    stripe_token = resp[0].stripe_token;
                    cb();
                }
                else {
                    return responses.sendCustomResponse(res, responses.responseMessageCode.NO_CARD,
                        constants.responseFlags.NO_CARD, {});
                }
            })
        },
        get_booking: function (cb) {
            let sql = 'SELECT * FROM `tb_bookings` WHERE id = ? AND `booking_status` = ? AND `payment_status` = ?';
            let params = [bookingId, 'Success', 'Pending'];
            connection.query(sql, params, function (err1, resp) {
                if (err1) {
                    cb(err1);
                }
                else {
                    cost = resp[0].price;
                    cb();
                }
            });
        },
       function (err, cb) {
            try {
                cost = Number(cost);
            } catch (e) {
                cb(e);
            }
            charge = stripe.charges.create({
                amount: cost * 100,
                currency: "usd",
                customer: stripe_id,
                card: stripe_token,
                description: 'make payment to shop',
                destination: {
                    account: shop_account
                },
                metadata: { 'user': user, 'bookingId': bookingId }
            }, function (err, charge) {
                if (err && (err.type == 'StripeCardError' || err.type == "parameter_unknown")) {
                    let response = {
                        error: error,
                        cost: cost,
                        status: 'failed'
                    };
                    cb(null, response);
                }
                else {
                    let response = {
                        cost: cost,
                        status: 'Success',
                        charge: charge
                    };
                    let sql = 'UPDATE `tb_bookings` SET `payment_status` = ? WHERE id = ?';
                    let params = ['Success', bookingId];
                    connection.query(sql, params, function (err1, resp) {
                        if (err1) {
                            cb(err1);
                        }
                        else {
                            cb(null, response)
                        }
                    });
                }
            });
        }
    }, function (error, result) {
        if (error) {
            return responses.sendCustomResponse(res, responses.responseMessageCode.SHOW_ERROR_MESSAGE,
                constants.responseFlags.SHOW_ERROR_MESSAGE, {});
        }
        else {
            if (result.make_payment.charge == null) {
                charge1 = '';
            }
            let finalResult = {
                cost: cost,
                status: result.make_payment.status,
                charge: charge1,
                user: user,
                bookingId: bookingId
            }
                if (err) {
                    return responses.sendCustomResponse(res, responses.responseMessageCode.SHOW_ERROR_MESSAGE,
                        constants.responseFlags.SHOW_ERROR_MESSAGE, {});
                }
                else {
                    return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
                        constants.responseFlags.SHOW_ERROR_MESSAGE, finalResult);
                }
          
        }
    });
}