const mongoose = require('mongoose');
const businessUser = require("./businessUserModel");
const Menu = require("./menuModel").schema;

const schema = mongoose.Schema;

const businessSchema = new schema({
	business_name:{
		type:String,
		required:true,
		min:1,
		max:100
	},
	alias:{
		type:String,
		lowercase:true
	},
	business_phone:{
		type:String,
		min:3,
		max:14
	},
	site_url:{
		type:String
	},
	mail:{
		type:String,
		min:5,
		max:50
	},
	location:{
		address1: String,
		address2: String,
		city: {
			type: String,
		},
		zip_code: String,
		country: {
			type: String,
		},
		state: {
			type: String,
		},
	},
	info:{
		type:String
	},
	amenities:[{
		_id: false,
		name:String,
		case: Boolean,
		amenity_id:Number
	}],
	position:{
		type: {
      type: String,
      enum: ['Point'],
		},
		coordinates: {
      type: [Number],
    }
	},
	photos:[{
		_id: false,
		image: String,
		key: String
	}],
	price:{
		type:Number,
		default:1
	},
	price_unit:{
		currency:String,
		currency_id:Number
	},
	rating:{
		type: Number,
		default:0
	},
	hours:[{
		_id:false,
		start: String,
		end: String,
		day: Number,
		isOpen:Boolean
	}],
	is_closed: Boolean,
	review_count:{
		type: Number,
		default:0
	},
	nonApprovedCount:{
		type:Number,
		default:0
	},
	categories:[{
		name: String,
		category_id: Number,
	}],
	userBy:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'businessUser'
	},
	menu: [Menu],
	reviews:[{
		ratingValue: Number,
		text:String,
		createdTime:String,
		isApproved: Boolean,
		user_name:String,
		user_id:mongoose.Schema.Types.ObjectId
	}]
});

const index = { position: "2dsphere"};

businessSchema.index(index);

module.exports = mongoose.model('business', businessSchema);