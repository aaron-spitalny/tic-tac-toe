var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var React = require('react');
var ReactDOM = require('react-dom');
var userService = require('../mongoose/services/userService.js');
var gamesService = require('../mongoose/services/gamesService.js');
var jwt = require('jsonwebtoken');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

router.get('/logout', async function(req, res) {
    res.clearCookie('token');
    res.redirect("/");
});

router.post('/logout', async function(req, res) {
    res.clearCookie('username');
    res.clearCookie('id');
    res.send({"status": "OK"});
});

router.get('/getActiveGame', async function(req, res) {
    var configFile = req.app.get('appConfig');
    try {
        if (req.cookies == undefined) {
            res.redirect("/ttt");
        } else {
            var userJWTPayload = jwt.verify(req.cookies.token, configFile.secret);
            let login = await userService.logInUserByID(userJWTPayload.id);
            if (!login) {
                res.redirect("/ttt");
            } else {
                if (login.active == false) {
                    res.redirect("/ttt");
                } else {
                    //reset the grid
                    res.send({"status": "OK", "Grid": login.activeGame.grid});
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.redirect("/ttt")
    }
});

router.post('/listgames', async function(req, res) {
    var configFile = req.app.get('appConfig');
    try {
        if (req.cookies == undefined) {
            res.send({"status": "ERROR"});
        } else {
            var userJWTPayload = jwt.verify(req.cookies.token, configFile.secret)
            let login = await userService.logInUserByID(userJWTPayload.id);
            if (!login) {
                res.send({"status": "ERROR"});
            } else {
                if (login.active == false) {
                    res.send({"status": "ERROR"});
                } else {
                    let games = await gamesService.getGames(userJWTPayload.username);
                    res.send({"status": "OK", games: games.games});
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.send({"status": "ERROR"});
    }
});

router.post('/getgame', async function(req, res) {
    var configFile = req.app.get('appConfig');
    try {
        if (req.cookies == undefined) {
            res.send({"status": "ERROR"});
        } else {
            var userJWTPayload = jwt.verify(req.cookies.token, configFile.secret)
            let login = await userService.logInUserByID(userJWTPayload.id);
            if (!login) {
                res.send({"status": "ERROR"});
            } else {
                if (login.active == false) {
                    res.send({"status": "ERROR"});
                } else {
                    var gamesArray = new Array();
                    let games = await gamesService.getGames(userJWTPayload.username);
                    for (let i = 0; i < games.games.length; i++) {
                        if (games.games[i].id == req.body.id) {
                            gamesArray.push({status: "OK", grid: games.games[i].grid, winner: games.games[i].winner});
                        }
                    }
                    if (gamesArray.length == 0) {
                        res.send({"status": "ERROR"});
                    } else {
                        res.send(gamesArray[0]);
                    }
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.send({"status": "ERROR"});
    }
});


router.post('/getscore', async function(req, res) {
    var configFile = req.app.get('appConfig');
    try {
        if (req.cookies == undefined) {
            res.send({"status": "ERROR"});
        } else {
            var userJWTPayload = jwt.verify(req.cookies.token, configFile.secret)
            let login = await userService.logInUserByID(userJWTPayload.id);
            if (!login) {
                res.send({"status": "ERROR"});
            } else {
                if (login.active == false) {
                    res.send({"status": "ERROR"});
                } else {
                    res.send({"status": "OK",
                        "human": login.scores.human,
                        "wopr": login.scores.wopr,
                        "tie": login.scores.tie
                    });
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.send({"status": "ERROR"});
    }
});

router.get('/ttt/restart', async function(req, res) {
    var configFile = req.app.get('appConfig');
    try {
        if (req.cookies == undefined) {
            res.redirect("/ttt");
        } else {
            var userJWTPayload = jwt.verify(req.cookies.token, configFile.secret);
            let login = await userService.logInUserByID(userJWTPayload.id);
            if (!login) {
                res.redirect("/ttt");
            } else {
                if (login.active == false) {
                    res.redirect("/ttt");
                } else {
                    //reset the grid
                    await userService.updateActiveGrid(login, []);
                    res.send({"status": "OK", "winner": " ", "Grid": [" ", " ", " ", " ", " ", " ", " ", " ", " "]});
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.redirect("/ttt")
    }
});

router.post('/ttt/play', async function(req, res) {
    var configFile = req.app.get('appConfig');
    try {
        if (req.cookies == undefined) {
            res.redirect("/ttt");
        } else {
            var userJWTPayload = jwt.verify(req.cookies.token, configFile.secret);
            let user = await userService.logInUserByID(userJWTPayload.id);
            if (!user) {
                res.redirect("/ttt");
            } else {
                if (user.active == false) {
                    res.send({"status": "ERROR"});
                } else {
                    //check if the move is null
                    if (req.body.move == null) {
                        res.send({"status": "OK", "grid": user.activeGame.grid});
                        //validate the move
                    } else if (user.activeGame.grid[req.body.move] != " " && user.activeGame.grid.length > 0) {
                        res.send({"status": "ERROR", "grid": user.activeGame.grid});
                    } else {
                        var grid = user.activeGame.grid;
                        //if board is empty start new game
                        if (grid.length == 0) {
                            var grid = [
                                " ",
                                " ",
                                " ",
                                " ",
                                " ",
                                " ",
                                " ",
                                " ",
                                " "
                            ];
                            let updatedUser = await userService.initActiveGrid(user, grid);
                        }
                        console.log("input " + grid);
                        //make user move
                        grid[req.body.move] = "X";
                        //check for winner
                        var winner = checkForWinner(grid);
                        if (winner == undefined) {
                            //wopr makes a move
                            grid = makeMove(grid);
                            let updatedUser = await userService.updateActiveGrid(user, grid);
                            //check for winner
                            winner = checkForWinner(grid);
                            console.log("output " + grid);
                            if (winner == undefined) {
                                res.send({"status": "OK", "grid": grid});
                            } else {
                                //add to played games
                                await userService.incrementScore(
                                    user, (winner == "O")
                                    ? "wopr"
                                    : "tie");
                                game = {
                                    id: getRandomInt(1, 1000000000),
                                    start_date: user.activeGame.startDate,
                                    grid: grid,
                                    winner: winner
                                }
                                await gamesService.insertGame(user.username, game);
                                //reset the grid
                                await userService.updateActiveGrid(user, [" ", " ", " ", " ", " ", " ", " ", " ", " "]);
                                //add to played games
                                res.send({"status": "OK", "winner": winner, "grid": grid});
                            }
                        } else {
                            console.log("output " + grid);
                            //add to played games
                            await userService.incrementScore(
                                user, (winner == "X")
                                ? "human"
                                : "tie");
                            game = {
                                id: getRandomInt(1, 1000000000),
                                start_date: user.activeGame.startDate,
                                grid: grid,
                                winner: winner
                            }
                            await gamesService.insertGame(user.username, game);
                            //reset the grid
                            await userService.updateActiveGrid(user, [" ", " ", " ", " ", " ", " ", " ", " ", " "]);
                            res.send({"status": "OK", "winner": winner, "grid": grid});
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.redirect("/ttt");
    }
});

function checkForWinner(grid) {
    let result;
    if (checkForXWIn(grid) === "X") {
        result = "X";
    } else if (checkForOWIn(grid) === "O") {
        result = "O";
    } else if (checkForDraw(grid) === "D") {
        result = " ";
    }
    return result;
}

function checkForXWIn(grid) {
    let winner;
    winner = (grid[0] == "X" && grid[1] == "X" && grid[2] == "X")
        ? 'X'
        : " ";
    winner = ((grid[3] == "X" && grid[4] == "X" && grid[5] == 'X') || winner == "X")
        ? 'X'
        : " ";
    winner = ((grid[6] == "X" && grid[7] == "X" && grid[8] == 'X') || winner == "X")
        ? 'X'
        : " ";
    winner = ((grid[0] == "X" && grid[3] == "X" && grid[6] == 'X') || winner == "X")
        ? 'X'
        : " ";
    winner = ((grid[1] == "X" && grid[4] == "X" && grid[7] == 'X') || winner == "X")
        ? 'X'
        : " ";
    winner = ((grid[2] == "X" && grid[5] == "X" && grid[8] == 'X') || winner == "X")
        ? 'X'
        : " ";
    winner = ((grid[0] == "X" && grid[4] == "X" && grid[8] == 'X') || winner == "X")
        ? 'X'
        : " ";
    winner = ((grid[2] == "X" && grid[4] == "X" && grid[6] == 'X') || winner == "X")
        ? 'X'
        : " ";
    return winner;
}

function checkForOWIn(grid) {
    let winner;
    winner = (grid[0] == "O" && grid[1] == "O" && grid[2] == "O")
        ? "O"
        : " ";
    winner = ((grid[3] == "O" && grid[4] == "O" && grid[5] == "O") || winner == "O")
        ? "O"
        : " ";
    winner = ((grid[6] == "O" && grid[7] == "O" && grid[8] == "O") || winner == "O")
        ? "O"
        : " ";
    winner = ((grid[0] == "O" && grid[3] == "O" && grid[6] == 'O') || winner == "O")
        ? "O"
        : " ";
    winner = ((grid[1] == "O" && grid[4] == "O" && grid[7] == 'O') || winner == "O")
        ? "O"
        : " ";
    winner = ((grid[2] == "O" && grid[5] == "O" && grid[8] == 'O') || winner == "O")
        ? "O"
        : " ";
    winner = ((grid[0] == "O" && grid[4] == "O" && grid[8] == 'O') || winner == "O")
        ? "O"
        : " ";
    winner = ((grid[2] == "O" && grid[4] == "O" && grid[6] == 'O') || winner == "O")
        ? "O"
        : " ";
    return winner;
}

function checkForDraw(grid) {
    draw = "D";
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] === " ") {
            draw = " ";
        }
    }
    return draw;
}

function makeMove(grid) {
    var index = 9;
    index = goForWin(grid);
    if (index == 9) {
        index = blockWin(grid);
    }
    if (index == 9) {
        index = makeFirstMove(grid)
    }
    if (index == 9) {
        for (let i = 0; i < grid.length; i++) {
            if (grid[i] === " " && index === 9) {
                grid[i] = "O";
                index = i;
            }
        }
    } else {
        grid[index] = "O";
    }
    return grid;
}

function makeFirstMove(grid) {
    var index = 9;
    if (grid[4] == " ") {
        index = 4;
    } else if (grid[5] == "X" && grid[7] == "X" && grid[8] == " ") {
        index = 8;
    } else {
        for (let i = 0; i < 3; i += 2) {
            if (grid[i] == " ") {
                index = i;
                break;
            } else if (grid[i + 6] == " ") {
                index = i + 6;
                break;
            }
        }
    }
    return index;
}

function blockWin(grid) {
    var index = 9;
    for (let i = 0; i < 9; i += 3) {
        if ((grid[i] + grid[i + 1] + grid[i + 2]) == "XX ") {
            index = i + 2;
            break;
        } else if ((grid[i] + grid[i + 1] + grid[i + 2]) == "X X") {
            index = i + 1;
            break;
        } else if ((grid[i] + grid[i + 1] + grid[i + 2]) == " XX") {
            index = i;
            break;
        }
    }
    for (let i = 0; i < 3; i++) {
        if ((grid[i] + grid[i + 3] + grid[i + 6]) == "XX ") {
            index = i + 6;
            break;
        } else if ((grid[i] + grid[i + 3] + grid[i + 6]) == "X X") {
            index = i + 3;
            break;
        } else if ((grid[i] + grid[i + 3] + grid[i + 6]) == " XX") {
            index = i;
            break;
        }
    }
    var mul = 4;
    for (let i = 0; i < 3; i += 2) {
        if ((grid[i] + grid[i + (1 * mul)] + grid[i + (2 * mul)]) == "XX ") {
            index = i + (2 * mul);
            break;
        } else if ((grid[i] + grid[i + (1 * mul)] + grid[i + (2 * mul)]) == "X X") {
            index = i + (1 * mul);
            break;
        } else if ((grid[i] + grid[i + (1 * mul)] + grid[i + (2 * mul)]) == " XX") {
            index = i;
            break;
        }
        mul -= 2;
    }
    return index;
}

function goForWin(grid) {
    var index = 9;
    for (let i = 0; i < 9; i += 3) {
        if ((grid[i] + grid[i + 1] + grid[i + 2]) == "OO ") {
            index = i + 2;
            break;
        } else if ((grid[i] + grid[i + 1] + grid[i + 2]) == "O O") {
            index = i + 1;
            break;
        } else if ((grid[i] + grid[i + 1] + grid[i + 2]) == " OO") {
            index = i;
            break;
        }
    }
    for (let i = 0; i < 3; i++) {
        if ((grid[i] + grid[i + 3] + grid[i + 6]) == "OO ") {
            index = i + 6;
            break;
        } else if ((grid[i] + grid[i + 3] + grid[i + 6]) == "O O") {
            index = i + 3;
            break;
        } else if ((grid[i] + grid[i + 3] + grid[i + 6]) == " OO") {
            index = i;
            break;
        }
    }
    var mul = 4;
    for (let i = 0; i < 3; i += 2) {
        if ((grid[i] + grid[i + (1 * mul)] + grid[i + (2 * mul)]) == "OO ") {
            index = i + (2 * mul);
            break;
        } else if ((grid[i] + grid[i + (1 * mul)] + grid[i + (2 * mul)]) == "O O") {
            index = i + (1 * mul);
            break;
        } else if ((grid[i] + grid[i + (1 * mul)] + grid[i + (2 * mul)]) == " OO") {
            index = i;
            break;
        }
        mul -= 2;
    }
    return index;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
