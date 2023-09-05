const response = require("../response");
const CommonAllergies = require("../models/commonAllergies");

exports.createCommonAllergies = (req, res) => {
	let commonAllergies = new CommonAllergies(req.body);

	commonAllergies.save((err) => {
		if(err){
			return new response(null,err).error500(res);
		}
		return new response(commonAllergies, null).created(res);
	});
};