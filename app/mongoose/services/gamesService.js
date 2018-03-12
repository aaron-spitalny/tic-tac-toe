var mongoose = require('mongoose');
var gamesModel = require('../models/Games.js');


async function getGames(username) {
    return gamesModel.findOne({
        username: username
    });
}

async function insertGame(username, game) {
    gamesModel.findOneAndUpdate({
            username: username
        }, {
            $addToSet: {
                "games": game

            }
        },{upsert: true},
        function(err, response) {
            if (err) {
                return err;
            } else {
                return response;
            }
        });
}

module.exports = {
    getGames,
    insertGame
}
