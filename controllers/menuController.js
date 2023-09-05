const response = require("../response");
const aws = require('aws-sdk');
const Business = require('../models/businessModel');
const Review = require('../models/reviewModel');
const DishReview = require('../models/dishReviewModel');
const Menu = require('../models/menuModel');
const ObjectId = require('mongoose').Types.ObjectId;
const upload = require('../services/fileUpload');

const s3 = new aws.S3();

const singleUpload = upload.single("image");

const Bucket = "dinngu";

//Menüsü olan restorana yeni bir menü ekler
exports.addMenu = (req, res) => {
	Business.findByIdAndUpdate(
		req.params.business_id,
		{$push: {'menu': req.body.menu}},
		{new: true}
		)
		.select("_id")
		.lean()
		.exec((err, sub_menu) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!sub_menu){
				return new response().notFound(res);
			}
			return new response(sub_menu, null).success(res);
		})
};

exports.changeMenuPosition = (req, res) => {

	const {
		currentIndex,
		previousIndex
	} = req.body

	let id = null;
	if(ObjectId.isValid(req.params.business_id)){
		id = ObjectId(req.params.business_id);
	}

	Business.findByIdAndUpdate(
		req.params.business_id,
		{
			$set : {"menu": []}
		},
	)
	.select("menu")
	.lean()
	.exec((err, business) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(!business){
			return new response().notFound(res);
		}
		
		let tmp = business.menu[previousIndex]
		business.menu.splice(previousIndex, 1)
		business.menu.splice(currentIndex, 0, tmp)

		Business.findByIdAndUpdate(
			req.params.business_id,
			{$push:  {menu:business.menu}},
			{new: true},
		)
		.select("_id")
		.lean()
		.exec((err, sub_menu) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!sub_menu){
				return new response().notFound(res);
			}
			return new response(sub_menu, null).success(res);
		})
			
})
};

exports.changeSubMenuPosition = (req, res) => {
	const {
		currentIndex,
		previousIndex,
		menu_id
	} = req.body

	Business.find(
		{"menu":{ $elemMatch:{ _id:menu_id}}}, "business_name -_id")
		.select({"menu.$": 1})
		.lean()
		.exec((err, menus) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!menus){
				return new response().notFound(res);
			}
			if(menus){

				var tmp = menus[0].menu[0].sub_menu[previousIndex]
				menus[0].menu[0].sub_menu.splice(previousIndex, 1)
				menus[0].menu[0].sub_menu.splice(currentIndex, 0, tmp)

				Business.findByIdAndUpdate(
					req.params.business_id,
					{
						$set : {"menu.$[m].sub_menu": []}
					},
					{
						arrayFilters: [{"m._id": req.body.menu_id}]
					},
				)
				.select('_id')
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
						Business.findByIdAndUpdate(
							req.params.business_id,
							{$addToSet: {'menu.$[m].sub_menu': menus[0].menu[0].sub_menu}},
							{arrayFilters: [{'m._id':menu_id}], multi: true},
						)
						.select("_id")
						.lean()
						.exec((err, sub_menu) => {
							if(err){
								return new response(null, err).error500(res);
							}
							if(!sub_menu){
								return new response().notFound(res);
							}
							return new response(sub_menu, null).success(res);
						})
					}
			})
			}
		});
};

exports.changeDishPosition = (req, res) => {
	const {
		subIndex,
		currentIndex,
		previousIndex,
		menu_id,
		sub_menu_id
	} = req.body
	
	Business.find(
		{"menu":{ $elemMatch:{ _id:menu_id}}}, "business_name -_id")
		.select({"menu.sub_menu.$":1})
		.lean()
		.exec((err, menus) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!menus){
				return new response().notFound(res);
			}
			if(menus){
				var tmp = menus[0].menu[0].sub_menu[subIndex].dish[previousIndex]
				menus[0].menu[0].sub_menu[subIndex].dish.splice(previousIndex, 1)
				menus[0].menu[0].sub_menu[subIndex].dish.splice(currentIndex, 0, tmp)
				
				Business.findOneAndUpdate(
					{'menu._id': req.body.menu_id},
					{
						$set : {"menu.$[m].sub_menu.$[s].dish": []}
					},
					{
						arrayFilters: [{"m._id": menu_id}, {"s._id": sub_menu_id}]
					},
				)
				.select('_id')
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
						Business.findOneAndUpdate(
							{'menu._id': req.body.menu_id},
							{$addToSet: {'menu.$[m].sub_menu.$[s].dish': menus[0].menu[0].sub_menu[subIndex].dish}},
							{arrayFilters: [{'m._id':menu_id},{'s._id':sub_menu_id}], multi: true},
						)
						.select("_id")
						.lean()
						.exec((err, sub_menu) => {
							if(err){
								return new response(null, err).error500(res);
							}
							if(!sub_menu){
								return new response().notFound(res);
							}
							return new response(sub_menu, null).success(res);
						})
					}
				})
			}
		});
};

//Menüye yeni bir alt menü ekler
exports.addNewSubMenu = (req, res) => {
	Business.findByIdAndUpdate(
		req.params.business_id,
		{$addToSet: {'menu.$[m].sub_menu': req.body.sub_menu}},
		{arrayFilters: [{'m._id':req.body.menu_id}], multi: true},
		)
		.select("_id")
		.lean()
		.exec((err, sub_menu) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!sub_menu){
				return new response().notFound(res);
			}
			return new response(sub_menu, null).success(res);
		})
};

//Menüye Yeni yemek ekler.(Dish Array olarak atılması lazım)
exports.addNewDish = (req,res) => {
	var dish;
	
	singleUpload(req,res, function(err){
		dish= JSON.parse(req.body.dish)

		if(err)
		{
			
			return res.status(422).send({errors:[{title:'File Upload Error', detail: err.message}]})
		}
		else{
			if(req.file !== undefined)
			{
				dish.photo = {image:req.file.location, key: req.file.key};
			}
			else if(req.file === undefined)
			{
				dish.photo = {image:'',key:''}
			}
			//
			Business.findByIdAndUpdate(
				req.params.business_id,
				{$push: {'menu.$[m].sub_menu.$[s].dish': dish}},
				{arrayFilters: [{'m._id':req.body.menu_id},{'s._id':req.body.sub_menu_id}], multi: true},
			)
			.select("_id")
			.lean()
			.exec((err, dish) => {
				if(err){
					return new response(null, err).error500(res);
				}
				if(!dish){
					return new response().notFound(res);
				}
				return new response(dish, null).success(res);
			})
		}
	})
};

//Seçilen yemeğe yeni malzemeler ekler
exports.addNewIngredient = (req, res) => {
	Business.findOneAndUpdate(
		req.business_id,
		{$push: {'menu.$[m].sub_menu.$[s].dish.$[d].ingredient': {'$each': req.body.ingredient}}},
		{arrayFilters: [{'m._id':req.body.menu_id},{'s._id':req.body.sub_menu_id},{'d._id': req.body.dish_id}], multi: true},
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
			return new response(business, null).success(res);
	})
};

exports.updateMenuName = (req,res) =>{
	Business.findByIdAndUpdate(
		req.params.business_id,
		{
			$set: {'menu.$[m].name':req.body.name},
		},
		{
			arrayFilters: [{'m._id':req.body.menu_id}]
		})
		.select("_id")
		.lean()
		.exec((err, business) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!business){
				return new response().notFound(res);
			}
			return new response().success(res);
		});
};

//Alt menüyü günceller
exports.updateSubMenuName = (req,res) =>{
	Business.findByIdAndUpdate(
		req.params.business_id,
		{
			$set: {'menu.$[m].sub_menu.$[s].name':req.body.name},
		},
		{
			arrayFilters: [{'m._id':req.body.menu_id},{'s._id': req.body.sub_menu_id}]
		})
		.select("_id")
		.lean()
		.exec((err, business) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!business){
				return new response().notFound(res);
			}
			return new response().success(res);
	})
};

//Seçilen yemeği günceller
exports.updateDish = (req,res) => {
	
	singleUpload(req,res, function(err){
		const {menu_id, sub_menu_id} = req.body;
		
		var	dish = JSON.parse(req.body.dish)
		
		const previousImageKey = dish.photo;

		if(err)
		{
			return res.status(422).send({errors:[{title:'File Upload Error', detail: err.message}]})
		}
		else{
			if(req.file !== undefined)
			{
				dish.photo = {image:req.file.location, key: req.file.key};
			}
			
			Business.findByIdAndUpdate(
				req.params.business_id,
				{
					$set: {
						'menu.$[m].sub_menu.$[s].dish.$[d]':dish,
					},
				},
				{
					arrayFilters: [{'m._id':menu_id},{'s._id': sub_menu_id}, {'d._id': dish._id}]
				})
				.select("_id")
				.lean()
				.exec((err, business) => {
					if(err){
						return new response(null, err).error500(res);
					}
					if(!business){
						return new response().notFound(res);
					}
					if(req.file !== undefined && previousImageKey.key !== '' )
					{
						
						const params = {Bucket, Key: previousImageKey.key};

						s3.deleteObject(params, (err, data) => {
							if(err){
								return res.status(422).send(err);
							}
						});
					}
					return new response().success(res);
			})
		}
	})
};

//Seçilen menüyü siler
exports.deleteMenu = (req, res) => {

	Business.findByIdAndUpdate(
		req.params.business_id,
		{
			$pull : {"menu": {"_id": req.body.menu_id}},
		})
		.select("_id")
		.lean()
		.exec((err, business) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!business){
				return new response().notFound(res);
			}
			return new response().success(res);
	})
};

//Seçilen alt menüyü siler
exports.deleteSubMenu = (req, res) => {
	Business.findByIdAndUpdate(
		req.params.business_id,
		{
			$pull : {"menu.$[m].sub_menu": {"_id": req.body.sub_menu_id}},
		},
		{
			arrayFilters: [{"m._id": req.body.menu_id}]
		})
		.select("_id")
		.lean()
		.exec((err, business) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!business){
				return new response().notFound(res);
			}
			return new response().success(res);
	})
};

//Seçilen yemeği siler
exports.deleteDish = (req, res) => {
	Business.findByIdAndUpdate(
		req.params.business_id,
		{
			$pull : {"menu.$[m].sub_menu.$[s].dish": {"_id": req.body.dish_id}},
		},
		{
			arrayFilters: [{"m._id": req.body.menu_id},{"s._id": req.body.sub_menu_id}]
		})
		.select("_id")
		.lean()
		.exec((err, business) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!business){
				return new response().notFound(res);
			}
			if(business.dish){		
					const params = {Bucket, Key: req.body.dish_key};

					s3.deleteObject(params, (err, data) => {
						if(err){
							return res.status(422).send(err);
						}
					});
			}
			return new response().success(res);
	})
};

//Seçilen restoranın bütün menülerini listeler
exports.listMenus = (req, res) => {
	const alias = req.params.alias || '';

	Business.findOne({alias: alias},'business_name price_unit menu')
	.lean()
	.exec((err, menus) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(menus){
			return new response(menus, null).success(res);
		}
		return new response().notFound(res);
	});
};
exports.listMenusById = (req, res) => {
	const business_id = req.params.business_id;
	
	Business.findById(business_id,' business_name price_unit menu.name menu._id')
	.lean()
	.exec((err, menus) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(menus){
			return new response(menus, null).success(res);
		}
		return new response().notFound(res);
	});
};

exports.listSubMenu = (req, res) => {
	Business.find(
	{"menu":{ $elemMatch:{ _id:req.params.menu_id}}}, "business_name price_unit -_id")
	.select({"menu.$": 1})
	.lean()
	.exec((err, menus) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(!menus || menus === [])
		{
			return new response().notFound(res);
		}
		if(menus){
			return new response({name:menus[0].business_name, menu: menus[0].menu[0]}, null).success(res);
		}
	});
};

//Seçilen restoranın istenen menüsünü gösterir
exports.getSelectedMenu = (req, res) => {
	Business.findOne(
		{_id:req.params.business_id, 'menu._id':req.body.menu_id},
		'menu.$')
		.lean()
		.exec((err, menu) => {
			if(err){
				return new response(null, err).error500(res);
			}
	
			if(menu){
				return new response(menu, null).success(res);
			}
	
			return new response().notFound(res);
		});
};

exports.giveDishReview = async (req, res) => {
	const {
		user_id,
		business_id,
		menu_id,
		sub_menu_id,
		dish_id,
	} = req.body;

	const dish = {...req.body,isApproved: false};

	var totalReview;

	try{
		const addDishReview = await DishReview.updateOne(
			{
				'user_id': user_id,
				'business_id':business_id,
				'menu_id':menu_id,
				'sub_menu_id':sub_menu_id,
				'dish_id':dish_id
			},
			{$set: dish},
			{upsert:true, multi:true}
		).lean().exec();
	
		if(addDishReview)
		{
			const totalBusinessReview = await Review.countDocuments({
				business_id: ObjectId(req.body.business_id), isApproved: false
			}).exec();

			const totalDishReview = await DishReview.countDocuments({
				business_id: ObjectId(req.body.business_id), isApproved: false
			}).exec();
	
			if(totalBusinessReview || totalDishReview){
				totalReview = totalBusinessReview + totalDishReview;
			}
			const totalRatings = await DishReview.aggregate([
				{$match: {business_id: ObjectId(business_id), dish_id: ObjectId(dish_id)}},
				{$group: {_id: business_id, average:{$avg: '$ratingValue'}}}
			]).exec();

	
			if(totalRatings){
				let avgNum = totalRatings[0].average
				avgNum = avgNum.toFixed(1);
				avgNum = parseFloat(avgNum);
	
				const updateBusiness = await Business.findByIdAndUpdate(
					business_id,
					{
						$set: {
								'menu.$[m].sub_menu.$[s].dish.$[d].rating': avgNum,
								nonApprovedCount: totalReview
						},
					},
					{
						arrayFilters: [{'m._id':menu_id},{'s._id': sub_menu_id}, {'d._id': dish_id}]
					}
				).select({"rating":1})
				.lean()
				.exec();
	
				if(updateBusiness){
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