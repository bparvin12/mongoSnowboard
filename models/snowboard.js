var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SnowboardSchema = new Schema({
    snowboard: {
        type: String
    },
    price: {
        type: String 
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Snowboard = mongoose.model("Snowboard", SnowboardSchema);

module.exports = Snowboard;