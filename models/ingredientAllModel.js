const mongoose = require('mongoose');

const schema = mongoose.Schema;

const ingredientAllSchema = new schema({
	Lng_code:String,
	content:[{
		_id:false,
		sub_id: Number,
		name: {
			type:String,
			lowercase: true
		}
	}]
});

module.exports = mongoose.model("ingredientAll", ingredientAllSchema);