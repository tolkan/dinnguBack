const mongoose = require('mongoose');

const schema = mongoose.Schema;

const commonAllergiesSchema = new schema({
	Lng_code:String,
	content:[{
		title:String,
		sub_content:[{
			_id:false,
			sub_id:Number,
			name: {
				type:String,
				lowercase: true
			}
		}]
	}]
});

module.exports = mongoose.model('commonAllergies', commonAllergiesSchema);