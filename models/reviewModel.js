const mongoose = require('mongoose');
const user = require("./userModel");
const business = require("./businessModel");

const schema = mongoose.Schema;

const reviewSchema = new schema({
		ratingValue: Number,
		user_id:{
			type: mongoose.Schema.Types.ObjectId,
			ref:'user'
		},
		business_id:{
			type: mongoose.Schema.Types.ObjectId,
			ref:'business'
		},
		business_name:String,
		text:String,
		user_name:String,
		createdTime:String,
		isApproved: Boolean
});

module.exports = mongoose.model('review', reviewSchema);