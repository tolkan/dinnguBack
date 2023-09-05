const mongoose = require('mongoose');

const schema = mongoose.Schema;

const amenitiesSchema = new schema({
	Lng_code:String,
	content:[{
		_id:false,
		name:String,
		case:Boolean,
		amenity_id: Number
	}]
});

module.exports = mongoose.model('amenities', amenitiesSchema);