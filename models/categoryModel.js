const mongoose = require('mongoose');

const schema = mongoose.Schema;

const categorySchema = new schema({
		Lng_code:String,
		content:[{
			_id:false,
			name:String,
			case:Boolean,
			category_id:Number
		}]
});

module.exports = mongoose.model('category', categorySchema);