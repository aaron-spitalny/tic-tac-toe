var mongoose = require('mongoose');


const GamesSchema = mongoose.Schema({
    username: {type: String, required: true, index:{unique: true}, lowercae: true},
    games: []
});

module.exports = mongoose.model('Games', GamesSchema);
