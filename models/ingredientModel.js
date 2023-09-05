const mongoose = require('mongoose');

const schema = mongoose.Schema;

const ingredientSchema = new schema({
	Lng_code: String,
	content: [{
		content_id: Number,
		title:String,
		sub_content:[{
			_id:false,
			sub_id: Number,
			name: {
				type:String,
				lowercase: true
			}
		}]
	}]
});

module.exports = mongoose.model("ingredients", ingredientSchema);
