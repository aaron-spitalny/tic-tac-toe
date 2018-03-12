var mongoose = require('mongoose');
var userModel = require('../models/User.js');

async function getAll() {
    return userModel.find({});
}

async function getUserByEmail(email) {
    return userModel.findOne({
        email: email
    });
}

async function getUserByUsername(username) {
    return userModel.findOne({
        username: username
    });
}

async function createUser(data) {
    var user = new userModel(data);
    return user.save();
}

async function verifyUser(email) {
    return userModel.update({
        email: email
    }, {
        $set: {
            active: true
        }
    });
}

async function verifyUserByKey(key) {
    return userModel.update({
        _id: key
    }, {
        $set: {
            active: true
        }
    });
}

async function logInUser(body) {
    return userModel.findOne({
        username: body.username,
        password: body.password
    });
}

async function logInUserByID(id) {
    return userModel.findOne({
        _id: id
    });
}

async function initActiveGrid(user, grid) {
    user.set({
        activeGame: {
            grid: grid,
            startDate: Date.now()
        }
    });
    user.markModified('activeGame');
    user.save(function(err, updatedUser) {
        if (err) {
            return err;
        } else {
            return updatedUser;
        }
    });
}

async function updateActiveGrid(user, grid) {
    user.set({
        activeGame: {
            grid: grid
        }
    });
    user.markModified('activeGame');
    user.save(function(err, updatedUser) {
        if (err) {
            return err;
        } else {
            return updatedUser;
        }
    });
}

async function incrementScore(user, winner) {
     winner = "scores." + winner;
    userModel.update({
            _id: user._id
        }, {
            $inc: {
                [winner]: 1
            }
        },
        function(err, response) {
            if (err) {
                return err;
            } else {
                return response;
            }
        });
}

module.exports = {
    createUser,
    getUserByEmail,
    getUserByUsername,
    getAll,
    verifyUser,
    verifyUserByKey,
    logInUser,
    initActiveGrid,
    incrementScore,
    updateActiveGrid,
    logInUserByID
}
