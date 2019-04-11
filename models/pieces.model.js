let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PieceSchema = new Schema({
    owner: String,
    title: String,
    composer: String,
    description: String,
    parts: String,
});

module.exports = mongoose.model('piece', PieceSchema);
