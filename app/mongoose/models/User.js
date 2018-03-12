var mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {type: String, required: true, index:{unique: true}, lowercae: true},
    email: {type: String, required: true, index:{unique: true}, lowercae: true},
    password: {type: String, required: true},
    active: {type: Boolean, required: true, default: false},
    scores:{
        human: {type: Number, required: true, default: 0},
        wopr: {type: Number, required: true, default: 0},
        tie: {type: Number, required: true, default: 0}
    },
    activeGame:{
        grid: [],
        startDate: Number
    }
});

module.exports = mongoose.model('User', UserSchema);
