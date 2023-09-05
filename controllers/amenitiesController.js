const response = require("../response");
const Amenities = require("../models/amenitiesModel");

exports.createAmenities = (req, res) => {
	let amenities = new Amenities(req.body);

	amenities.save((err) => {
		if(err){
			return new response(null,err).error500(res);
		}
		return new response(amenities, null).created(res);
	});
};