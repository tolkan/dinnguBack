const mongoose = require('mongoose');

const schema = mongoose.Schema;

const languageCodeSchema = new schema({
	Language_code:String,
	Language: String,
	Language_id: Number
});

module.exports = mongoose.model("languageCode", languageCodeSchema);