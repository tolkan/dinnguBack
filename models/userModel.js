const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = new schema({
	password: {
		type: String,
		min:6,
		max:20,
		required: true,
	},
	name:{
		type: String,
		min: 2,
		max: 50,
		required: true,
	},
	surname:{
		type: String,
		min: 2,
		max: 50,
		required: true,
	},
	email:{
		type:String,
		min:5,
		max:50,
		required:true,
		unique: true
	},
	phone:{
		type:String,
		min:3,
		max:14,
	},
	isActivated:{
		type:Boolean,
		default:false
	}
});

module.exports = mongoose.model('user', userSchema);