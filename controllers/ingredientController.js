const response = require("../response");
const Ingredient = require("../models/ingredientModel");
const IngredientAll = require("../models/ingredientAllModel");

//Yeni yemek malzemeleri listesi oluşturur
exports.create = (req, res) => {

	let ingredient = new Ingredient(req.body); 

	ingredient.save((err) => {
		if(err){
			return new response(null,err).error500(res);
		}
		return new response(ingredient, null).created(res);
	});
};

exports.createAll = (req, res) => {

	let ingredient = new IngredientAll(req.body); 

	ingredient.save((err) => {
		if(err){
			return new response(null,err).error500(res);
		}
		return new response(ingredient, null).created(res);
	});
};

exports.getBySubId = (req, res) => {
	Ingredient.findOne({language_code:req.body.language_code, 'content.sub_content.sub_id':req.params.sub_id},
	'content.sub_content.$.name')
	.lean()
	.exec((err, name) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(!name){
			return new response().notFound(res);
		}
		else{
			return new response(name, null).success(res);
		}
	});
};