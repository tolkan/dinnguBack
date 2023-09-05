const mongoose = require('mongoose');
const user = require("./userModel");
const business = require("./businessModel");
const menu = require("./menuModel");
const dish = require('./dishModel');

const schema = mongoose.Schema;

const dishReviewSchema = new schema({
	ratingValue: Number,
	user_id:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	business_id:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'business'
	},
	menu_id:{
		type: mongoose.Schema.Types.ObjectId,
	},
	sub_menu_id:{
		type: mongoose.Schema.Types.ObjectId,
	},
	dish_id:{
		type: mongoose.Schema.Types.ObjectId,
	},
	business_name:String,
	dishName:String,
	photo:String,
	user_name:String,
	text:String,
	isApproved: Boolean,
	createdTime: String
});

module.exports = mongoose.model('dishReview', dishReviewSchema);