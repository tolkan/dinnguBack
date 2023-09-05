const mongoose = require('mongoose');

const schema = mongoose.Schema;

const dishSchema = new schema({
	name: String,
	price:{
		value:String,
	},
	rating: Number,
	dish_review_count: {
		tpye:String,
		default:0
	},
	photo: {
		image:String,
		key:String
	},
	ingredient:[{
		_id:false,
		sub_id:Number,
		name:String,
	}],
	reviews:[{
		ratingValue: Number,
		text:String,
		createdTime:String,
		isApproved: Boolean,
		user_name:String,
		user_id:mongoose.Schema.Types.ObjectId
	}]
});

module.exports = mongoose.model('dish',dishSchema);