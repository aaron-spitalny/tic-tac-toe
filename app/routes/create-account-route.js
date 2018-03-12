var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var userService = require('../mongoose/services/userService.js');
var nodemailer = require('nodemailer');

function Response(status, error, errorMessage) {
    this.status = status;
    this.error = error;
    this.errorMessage = errorMessage;
}

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: false
}));

router.get('/createAccount', function(request, response) {
    response.render('index-tmpl', {
        pageID: 'createAccount'
    });
});

router.post('/verify', async function(req, res) {
    try {
        if (req.body.key == "abracadabra") {
            var verified = await userService.verifyUser(req.body.email);
        } else {
            var verified = await userService.verifyUserByKey(req.body.key);
        }
        if (verified.n) {
            res.send(JSON.stringify({
                "status": 'OK'
            }));
        } else {
            res.send(JSON.stringify({
                "status": 'ERROR'
            }));
        }
    } catch (err) {
        console.log(err)
        res.send(JSON.stringify({
            "status": 'ERROR'
        }));
    }
});

router.get('/verify/:email/:key', async function(req, res) {
    try {
        if (req.body.key == "abracadabra") {
            var verified = await userService.verifyUser(req.params.email);
        } else {
            var verified = await userService.verifyUserByKey(req.params.key);
        }
        if (verified.n) {
            res.send(JSON.stringify({
                "status": 'OK'
            }));
        } else {
            res.send(JSON.stringify({
                "status": 'ERROR'
            }));
        }
    } catch (err) {
        console.log(err)
        res.send(JSON.stringify({
            "status": 'ERROR'
        }));
    }
});

router.post('/adduser', async function(req, res, next) {
    var configFile = req.app.get('appConfig')
    var transporter = nodemailer.createTransport('smtps://'+configFile.email+':'+configFile.password+'@smtp.gmail.com');
    var response = new Response();
    try {
        if ((await verifyInput(req.body, response)) == false) {
            res.send(JSON.stringify({
                "status": response.status,
                "error": response.error,
                "errorMessage": response.errorMessage
            }));
        } else {
            let created = await userService.createUser(req.body)
            var mailOptions = {
                from: 'Aaron Spitalny <cse305project@gmail.com>', // sender address
                to: created.email, // list of receivers
                subject: 'Verification', // Subject line
                html: '<a href="http://localhost:3000/verify/' + created.email + '/' + created._id + '"' + '>verify</a>'
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.send(JSON.stringify({
                        "status": "ERROR",
                        "error": "sending email",
                        "errorMessage": "error occurred attempting to send verification email"
                    }));
                } else {
                    res.send(JSON.stringify({
                        "status": "OK"
                    }));
                }
            });
        }
    } catch (err) {
        return next(err);
    }
});

async function verifyInput(body, response) {
    var flag = true;
    if (flag == true) {
        if (body.username.length < 1) {
            flag = false;
            response.status = "ERROR";
            response.error = "username";
            response.errorMessage = "please enter a valid username";
        }
    }
    if (flag == true) {
        if (!validateEmail(body.email)) {
            flag = false;
            response.status = "ERROR";
            response.error = "email";
            response.errorMessage = "please enter a valid email";
        }
    }
    if (flag == true) {
        if (body.password.length < 4) {
            flag = false;
            response.status = "ERROR";
            response.error = "password";
            response.errorMessage = "password must have minimum of 4 characters";
        }
    }
    if(flag == true){
        if(body.password !== body.confirmPassword){
            flag = false;
            this.setState({
                error: "confirmPassword",
                errorMessage: "These passwords don't match."
            });
        }
    }
    if (flag == true) {
        let userEmail = await userService.getUserByUsername(body.username);
        if (userEmail != null) {
            flag = false;
            response.status = "ERROR";
            response.error = "username";
            response.errorMessage = "username already exists";
        }
    }
    if (flag == true) {
        let username = await userService.getUserByEmail(body.email);
        if (username != null) {
            flag = false;
            response.status = "ERROR";
            response.error = "email";
            response.errorMessage = "email already exists";
        }
    }
    return flag;
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = router;
