const aws = require('aws-sdk');
const upload = require('../services/fileUpload');
const Business = require("../models/businessModel");
const response = require("../response");
const s3 = new aws.S3();

const multiUpload = upload.array("image",12);
//const singleUpload = upload.single("image");

exports.imageUpload = (req, res) =>{
	
	var imageUrl = [];

	multiUpload(req,res, function(err){
		
		if(err)
		{
			return res.status(422).send({errors:[{title:'File Upload Error', detail: err.message}]})
		}
		req.files.forEach(element => {
			imageUrl.push({image:element.location, key: element.key})
		});
	
		Business.findByIdAndUpdate(
			req.params.business_id,
			{$push:{photos: imageUrl}},
		)
		.select("_id")
		.lean()
		.exec((err, business) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!business){
				return new response().notFound(res);
			}
			if(business)
			{
				return new response().success(res);
			}
		})
	})
}