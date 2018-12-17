var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
const port = process.env.port || config.get('PORT');
connection = mysql.createConnection(config.get('database_settings'));

let adminController = require('./admin/adminController');
let userController = require('./user/userController');
let cardsController = require('./cards/cardsController');
let userValidator = require('./user/userValidator');
let adminValidator = require('./admin/adminValidator');
let cardsValidator = require('./cards/cardsValidator');

const app = express();
config = require('config');

connection.connect(function (err) {
    if (err) {
        console.log('error when connecting to db:', err);
    } else {
        console.log('database connected at...', config.get('database_settings.mysqlPORT'));
    }
});

app.post('/user/register', userValidator.userRegistration, userController.userRegister);
app.post('/user/login', userController.userLogin);
app.post('/user/logout', userController.userLogout);
app.post('admin/reg', adminValidator.adminRegistration,adminController.adminRegister);
app.post('/admin/login', adminController.adminLogin);
app.get('/admin/logout', adminController.adminLogout);
app.post('/createBookin', userController.createBooking);
app.get('/getBooking', userController.getBooking);
app.post('/addCard', cardsValidator.createCard,cardsController.createCard);
app.get('/getCards', cardsController.getCards);
app.post('/deleteCard', cardsController.deleteCard);
app.post('/makePayment', cardsController.createPayment);

const server = app.listen(port, function (err, data) {
    console.log(`Server running at ${port} `);
    if (err) {
        console.log(err);
    } else {
        setImmediatePromise().then((value) => {
            console.log("server connected!!!!");
        });
    }
});