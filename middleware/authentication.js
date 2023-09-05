const User = require("../models/userModel");
const BusinessUser = require("../models/businessUserModel");
const bcrypt = require('bcrypt');

exports.checkUser = async (email, password) => {

	try{
		const user = await User.findOne({email:email}).select("_id name surname password isActivated").lean().exec();

		if(user){

			try{
				const passwordCheck = await bcrypt.compare(password, user.password);

				if(passwordCheck){
					return {exists: true, isLoggin: passwordCheck , user: user, isActivated: user.isActivated};
				}

				return {exists: true, isLoggin: passwordCheck, isActivated: user.isActivated}

			}catch(err){
				return {error:err};
			}
		}
		return {exists: null, isLoggin:user,isActivated: user.isActivated};

	}catch(err){
		return {error:err};
	}
};

exports.checkBusinessUser = async (email, password) => {
	try{
		const user = await BusinessUser.findOne({email:email})
		.select("_id name surname password isActivated")
		.lean()
		.exec();

		if(user){

			try{
				const passwordCheck = await bcrypt.compare(password, user.password);

				if(passwordCheck){
					return {exists: true, isLoggin: passwordCheck , user: user, isActivated: user.isActivated};
				}

				return {exists: true, isLoggin: passwordCheck, isActivated: user.isActivated}

			}catch(err){
				return {error:err};
			}
		}
		return {exists: null, isLoggin:user , isActivated: user.isActivated};

	}catch(err){
		return {error:err};
	}
};