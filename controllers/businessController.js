const response = require("../response");
const aws = require('aws-sdk');
const Business = require("../models/businessModel");
const Review = require('../models/reviewModel');
const DishReview = require('../models/dishReviewModel');
const mongoose = require('mongoose');
const { Result } = require("express-validator");
const ObjectId = require('mongoose').Types.ObjectId;
const upload = require('../services/fileUpload');
const { collection } = require("../models/businessModel");

const s3 = new aws.S3();

const multiUpload = upload.array("image",12);

//Tek sorguda listelenen maksimum döküman sayısı
const Limit = 30;
//Approximate equatorial radius of the earth
const EqRadius = 3963.2;

const Bucket = "dinngu";

exports.addBusiness = (req, res) => {
	
	const {
		business_name,
		location,
		position
	} = req.body;

	const businessNameAlias = business_name.split(' ').join('-');

	const cityAlias = location.city.split(' ').join('-');

	let business = new Business();
			business.business_name = business_name,
			business.location = location,
			business.userBy = req.params.businessUser_id,
			business.position = position;
			business.hours = [
				{
					day:1,
					isOpen: false
				},
				{
					day:2,
					isOpen: false
				},
				{
					day:3,
					isOpen: false
				},
				{
					day:4,
					isOpen: false
				},
				{
					day:5,
					isOpen: false
				},
				{
					day:6,
					isOpen: false
				},
				{
					day:7,
					isOpen: false
				},
			],
			business.amenities=[
				{name: "Takes Reservations", case:false, amenity_id:1},
				{name: "Offers Delivery", case:false, amenity_id:2},
				{name: "Offers Takeout", case:false, amenity_id:3},
				{name: "Accepts Credit Cards", case:false, amenity_id:4},
				{name: "Keto Options", case:false, amenity_id:5},
				{name: "Vegan Options", case:false, amenity_id:6},
				{name: "Limited Vegetarian Options", case:false, amenity_id:7},
				{name: "Outdoor Seating", case:false, amenity_id:8},
				{name: "Upscale, Classy", case:false, amenity_id:9},
				{name: "Moderate Noise", case:false, amenity_id:10},
				{name: "Dressy", case:false, amenity_id:11},
				{name: "Good for Groups", case:false, amenity_id:12},
				{name: "Good For Kids", case:false, amenity_id:13},
				{name: "Good for Dinner", case:false, amenity_id:14},
				{name: "Street Parking", case:false, amenity_id:15},
				{name: "Garson Servisi", case:false, amenity_id:16},
				{name: "Free Wi-Fi", case:false, amenity_id:17},
				{name: "Tüm Alkoller", case:false, amenity_id:18},
				{name: "Engelli Erişebilirliği", case:false, amenity_id:19},
				{name: "TV", case:false, amenity_id:20},
				{name: "Herkese Açık", case:false, amenity_id:21},
				{name: "Sit-down dining", case:false, amenity_id:22},
				{name: "Accepts Android Pay", case:false, amenity_id:23},
				{name: "Accepts Apple Pay", case:false, amenity_id:24},
				{name: "Accepts Cryptocurrency", case:false, amenity_id:25},
				{name: "Bike Parking", case:false, amenity_id:26},
				{name: "Happy Hour", case:false, amenity_id:27},
				{name: "Dogs Allowed", case:false, amenity_id:28},
				{name: "Pool Table", case:false, amenity_id:29},
				{name: "Smoking", case:false, amenity_id:30},
				{name: "Gender Neutral Restrooms", case:false, amenity_id:31},
				{name: "Good For Dancing", case:false, amenity_id:32},
				{name: "By Appointment Only", case:false, amenity_id:33},
				{name: "Online Booking", case:false, amenity_id:34},
				{name: "Offers Military Discount", case:false, amenity_id:35},
				{name: "Coat Check", case:false, amenity_id:36},
				{name: "Waitlist", case:false, amenity_id:37},
				{name: "Beer & Wine Only", case:false, amenity_id:38},
				{name: "Garage Parking", case:false, amenity_id:39},
				{name: "Valet Parking", case:false, amenity_id:40},
				{name: "Private Parking Lot", case:false, amenity_id:41},
				{name: "Validated Parking", case:false, amenity_id:42},
				{name: "Good for Breakfast", case:false, amenity_id:43},
				{name: "Good for Brunch", case:false, amenity_id:44},
				{name: "Good for Lunch", case:false, amenity_id:45},
				{name: "Good for Dessert", case:false, amenity_id:46},
				{name: "Good for Late Night", case:false, amenity_id:47},
				{name: "DJ", case:false, amenity_id:48},
				{name: "Karaoke", case:false, amenity_id:49},
				{name: "Juke Box", case:false, amenity_id:50},
				{name: "Live", case:false, amenity_id:51},
				{name: "Paid Wi-Fi", case:false, amenity_id:52},
			]

			business.save((err) => {
				if(err){
					return new response(null,err).error500(res);
				}
				if(business){
					const alias = `${businessNameAlias}-${cityAlias}-${business._id}`;

					Business.updateOne(
						{_id: business._id},
						{alias: alias}
					)
					.lean()
					.exec((err, modified) => {
						if(err){
							return new response(null,err).error500(res);
						}
						return new response().success(res);
					});
				}
			});
}

//Aliasa göre işletmeyi bulur
exports.getBusinessByAlias = (req, res) => {
	if(req.params.alias){
		var alias = req.params.alias.split('-')
		var business_id = alias[alias.length - 1];

		Business.findById(business_id, '-menu -categories._id')
		.lean()
		.exec((err, business) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(business){
				return new response(business, null).success(res);
			}
			else {
				return new response().notFound(res);
			}
		});
	}
	else{
		return new response().notFound(res);
	}
};

exports.getBusinessById = (req, res) => {

	Business.findById(req.params.business_id, '-menu -categories._id')
	.lean()
	.exec((err, business) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(business){
			return new response(business, null).success(res);
		}
		else {
			return new response().notFound(res);
		}
	});
};

//Kullanıcaya ayit işletmeleri listeler
exports.listByUserId = (req, res) => {
	const _id = req.params.businessUser_id;

	Business.find({userBy: _id}).populate('userBy','_id')
	.select("alias business_name business_phone info location categories price rating photos")
	.lean()
	.exec((err, businesses) => {
		if(err){
			return new response(null, err).error500(res);
		}
		return new response(businesses, null).success(res);
	});
};

exports.listReviewCountByBusiness = (req, res) => {
	const _id = req.params.businessUser_id;

	Business.find({userBy: _id}).populate('userBy','_id')
	.sort([["nonApprovedCount",-1]])
	.select("business_name nonApprovedCount -userBy")
	.lean()
	.exec((err, businesses) => {
		if(err){
			return new response(null, err).error500(res);
		}
		return new response(businesses, null).success(res);
	});
};

exports.listReviewsByBusiness = async (req, res) => {

	const nonApprovedBusinessReviews = (params) => {
		return Review.find({business_id: params, isApproved: false}).lean().exec();
	};

	const AllBusinessReviews = (params) => {
		return Review.find({business_id: params, isApproved: true}).lean().exec();
	};

	const nonApprovedDishReviews = (params) => {
		return DishReview.find({business_id: params, isApproved: false}).lean().exec();
	};

	const AllDishReviews = (params) => {
		return DishReview.find({business_id: params, isApproved: true}).lean().exec();
	};

	const array = [
		nonApprovedBusinessReviews(req.params.business_id),
		nonApprovedDishReviews(req.params.business_id),
		AllBusinessReviews(req.params.business_id),
		AllDishReviews(req.params.business_id),
	]
	
	try{
		const promise = await Promise.all(array);
		
		if(promise){
			return new response(promise,null).success(res);
		}
	}catch(err){
		return new response(null, err).error500(res);
	}

};

//İşletme bilgilerini günceller
exports.update = (req, res) => {
	const {business_name, location} = req.body;
	const business_id = req.params.business_id;
	
	var businessNameAlias = business_name.split(' ').join('-');
	var cityAlias = location.city.split(' ').join('-');

	const alias = `${businessNameAlias}-${cityAlias}-${business_id}`;

	const businessBody = {...req.body, alias: alias}

	Business.findByIdAndUpdate(
		req.params.business_id,
		businessBody,
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
			if(req.body.deletedImages.length > 0)
			{
				const tmp = req.body.deletedImages;
				var keys = [];

				tmp.forEach(element => {
					keys.push({Key: element});
				});

				const params = {Bucket, Delete: {Objects: keys}};

				s3.deleteObjects(params, (err, data) => {
					if(err){
						return res.status(422).send(err);
					}
				});
			}

			return new response().success(res);
		}
	});
};

//İşletmeyi siler
exports.delete = (req, res) => {

	Business.findByIdAndDelete(req.params.business_id)
	.select("_id photos")
	.lean()
	.exec((err,business) =>{
		if(err){
			return new response(null, err).error500(res);
		}

		if(!business){
			return new response().notFound(res);
		}

		Review.deleteMany({business_id: req.params.business_id})
		.exec((err, result) => {
			if(err){
				return new response(null, err).error500(res);
			}
	
			if(!result){
				return new response().notFound(res);
			}
			
			DishReview.deleteMany({business_id: req.params.business_id})
			.exec((err, dishResult) => {
				if(err){
					return new response(null, err).error500(res);
				}
		
				if(!dishResult){
					return new response().notFound(res);
				}
				
				if(business.photos){
					if(business.photos.length > 0 ){
						const tmp = business.photos;
						var keys = [];
		
						tmp.forEach(element => {
							keys.push({Key: element});
						});
		
						const params = {Bucket, Delete: {Objects: keys}};
		
						s3.deleteObjects(params, (err, data) => {
							if(err){
								return res.status(422).send(err);
							}
						});
					}
				}
				return new response().success(res);	
			})
		});
	})
};

//İşletmeleri isimlerine veya kategorisine göre arar
exports.search = async (req, res) => {

	const page = parseInt(req.query.page);

	const skipBusiness = (page - 1) * Limit;
	
	const {
		search,
		sorting,
		latitude,
		longitude
	} = req.query
	
	var sortType;
	var sortValue;
	var price1 =  parseFloat(req.query.price1);
	var price2 =  parseFloat(req.query.price2);
	var price3 =  parseFloat(req.query.price3);
	var price4 =  parseFloat(req.query.price4);

	if(sorting == 0 || !sorting || sorting == undefined || sorting == null ){
		sortType = "score";
		sortValue = 1;
	}
	else if(sorting == 1){
		sortType = "distance";
		sortValue = -1;
	}
	else if(sorting == 2){
		sortType = "distance";
		sortValue = 1;
	}
	else if(sorting == 3){
		sortType = "rating";
		sortValue = -1;
	}
	else if(sorting == 4){
		sortType = "rating";
		sortValue = 1;
	}
	else if(sorting == 5){
		sortType = "price";
		sortValue = -1;
	}
	else if(sorting == 6){
		sortType = "price";
		sortValue = 1;
	}

	if(!price1 && !price2 && !price3 &&!price4){
		price1 = 1;
		price2 = 2;
		price3 = 3;
		price4 = 4;
	}
	
	if(!search || search === '' || search === null || search === undefined)
	{
		Business.aggregate([
			{
				'$geoNear': {
					'near': {
						'type': 'Point', 
						'coordinates': [
							parseFloat(longitude), parseFloat(latitude)
						]
					}, 
					'distanceField': 'distance', 
					"distanceMultiplier" : 0.001,
					'maxDistance': 15000, 
					'spherical': true
				}
			},{
				'$match': {
					'price': {
						'$in': [price1,price2,price3,price4]
					}
				}
			},{
				"$sort":{
					[sortType]:sortValue
				}
			},
			{
				'$skip': skipBusiness
			}, {
				'$limit': Limit
			}, {
				'$project': {
					'business_name': 1, 
					'location': 1, 
					'categories': 1, 
					'price': 1, 
					'rating': 1, 
					'photos': 1, 
					'position': 1, 
					'distance':1,
					"alias":1,
					'score': {
						'$meta': 'searchScore'
					}
				}
			}
		],(err, business) => {
			if(err){
				console.log(err)
				return new response(null, err).error500(res);
			}
			if(business){
				let count = business.length;
				
				return new response({count: count, business, longitude, latitude , page}, null).success(res)
			}
			else {
				return new response().notFound(res);
			}
		})
	}
	else{
		try{
			await Business.aggregate([
			{
				'$search': {
					'index': 'searchIndex', 
					'compound': {
						'should': [
							{
								'text': {
									'query': search, 
									'path': 'business_name', 
									'score': {
										'boost': {
											'value': 5
										}
									}, 
									'fuzzy': {
										'maxEdits': 2, 
										'prefixLength': 1
									}
								}
							}, {
								'text': {
									'query': search, 
									'path': 'categories.name', 
									'fuzzy': {
										'maxEdits': 2, 
										'prefixLength': 1
									}
								}
							}
						]
					}
				}
			}, {
				'$match': {
					'price': {
						'$in': [price1,price2,price3,price4]
					}
				}
			}, {
				'$project': {
					'business_name': 1, 
					'location': 1, 
					'categories': 1, 
					'price': 1, 
					'rating': 1, 
					'photos': 1, 
					'position': 1,
					"alias":1,
					'score': {
						'$meta': 'searchScore'
					}
				}
			}, {
				'$out': 'searchresults'
			}
		])
	
		let resultArray = await mongoose.connection.collection('searchresults').aggregate([
			{
				'$geoNear': {
					'near': {
						'type': 'Point', 
						'coordinates': [
							parseFloat(longitude), parseFloat(latitude)
						]
					}, 
					'distanceField': 'distance', 
					"distanceMultiplier" : 0.001,
					'maxDistance': 15000, 
					'spherical': true
				}
			},{
				"$sort":{
					[sortType]:sortValue
				}
			},
			{
				'$skip': skipBusiness
			}, {
				'$limit': Limit
			}
		])
		.toArray();
		let businessCount = resultArray.length

		return new response({count:businessCount, business: resultArray,longitude,latitude, page},null).success(res);

		}catch(err){
			console.log(err)
			return new response(null,err).error500(res);
		}
	}
};

exports.giveReview = async (req, res) => {
	
	let reviewBody = {...req.body,isApproved:false};

	var totalReview;

	try{
		const addReview = await Review.updateOne({
			'user_id': req.body.user_id, 'business_id':req.body.business_id},
			{$set: reviewBody},
			{upsert:true, multi:true}).exec();
		
		if(addReview){
			
			const totalBusinessReview = await Review.countDocuments({
				business_id: ObjectId(req.body.business_id), isApproved: false
			}).exec();

			const totalDishReview = await DishReview.countDocuments({
				business_id: ObjectId(req.body.business_id), isApproved: false
			}).exec();
	
			if(totalBusinessReview || totalDishReview){
				totalReview = totalBusinessReview + totalDishReview;
			}
			const totalRating = await Review.aggregate([
				{$match: {business_id: ObjectId(req.body.business_id)}},
				{$group: {_id: req.body.business_id, average:{$avg: '$ratingValue'}}}
			]).exec();
			
			if(totalRating){
				let avgNum = totalRating[0].average;
				avgNum = avgNum.toFixed(1);
				avgNum = parseFloat(avgNum);

				const updateBusiness = await Business.findByIdAndUpdate(req.body.business_id,
					{rating: avgNum,nonApprovedCount: totalReview})
					.select({ "rating":1})
					.lean()
					.exec()
		
				if(updateBusiness)
				{
					return new response().success(res);
				}
				else{
					return new response().notFound(res);
				}
			}
		}
	}catch(err){
		return new response(null, err).error500(res);
	}
};
