var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var userService = require('../mongoose/services/userService.js');
var jwt = require('jsonwebtoken');

function Response(status, error, errorMessage) {
    this.status = status;
    this.error = error;
    this.errorMessage = errorMessage;
}

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: false
}));


router.get(['/ttt', '/'], async function(req, res) {
    var configFile = req.app.get('appConfig');
    try {
        if (req.cookies == undefined || Object.keys(req.cookies).length === 0) {
            res.render('index-tmpl', {
                pageID: 'signIn'
            });
        } else {
            var userJWTPayload = jwt.verify(req.cookies.token, configFile.secret)
            let login = await userService.logInUserByID(userJWTPayload.id);
            if (!login) {
                   res.render('index-tmpl', {
                        pageID: 'signIn'
                    });
            } else {
                if (login.active == false) {
                       res.render('index-tmpl', {
                            pageID: 'signIn'
                        });
                } else {
                    res.render('play-tmpl', {
                        pageID: 'play',
                        name: userJWTPayload.username,
                        date: new Date(),
                    });
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.render('index-tmpl', {
             pageID: 'signIn'
         });
    }
});

router.post('/login', async function(req, res) {
    var configFile = req.app.get('appConfig');
    var response = new Response();
    try {
        if ((await verifyInput(req.body, response)) == false) {
            res.send(JSON.stringify({
                "status": response.status,
                "error": response.error,
                "errorMessage": response.errorMessage
            }));
        } else {
            let login = await userService.logInUser(req.body);
            if (!login) {
                res.send(JSON.stringify({
                    "status": 'ERROR',
                    "error": "username",
                    "errorMessage": "incorrect username or password"
                }));
            } else {
                if (login.active == false) {
                    res.send(JSON.stringify({
                        "status": 'ERROR',
                        "error": "username",
                        "errorMessage": "account is inactive"
                    }));
                } else {
                    var jwtPayload = {
                        usename: req.body.username,
                        id: login._id
                    }
                    var authJwtToken = jwt.sign(jwtPayload, configFile.secret)
                    res.cookie('token', authJwtToken, {expires: new Date(Date.now() + 900000)});
                    res.send(JSON.stringify({
                        "status": 'OK'
                    }));
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.send(JSON.stringify({
            "status": 'ERROR'
        }));
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
        if (body.password.length < 4) {
            flag = false;
            response.status = "ERROR";
            response.error = "password";
            response.errorMessage = "password must have minimum of 4 characters";
        }
    }
    return flag;
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}



module.exports = router;
