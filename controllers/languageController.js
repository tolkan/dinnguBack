const response = require("../response");
const mongoose = require('mongoose');
const Languages = require("../models/languageModel");
const Ingredient = require("../models/ingredientModel");
const IngredientAll = require("../models/ingredientAllModel");
const CommonAllergies = require("../models/commonAllergies");
const Amenities = require('../models/amenitiesModel');
const Category = require('../models/categoryModel');
const LanguageCode = require('../models/languageCodeModel');

exports.createLanguageWordList = (req, res) => {
	let languageWordList = new Languages(req.body);

	languageWordList.save((err) => {
		if(err){
			return new response(null,err).error500(res);
		}
		return new response(languageWordList, null).created(res);
	});
}

exports.createLanguageCode = (req, res) =>{
	let languageCodes = new LanguageCode(req.body);

	languageCodes.save((err) => {
		if(err){
			return new response(null,err).error500(res);
		}
		return new response(languageCodes, null).created(res);
	});
}

exports.getLanguageCode = (req,res) => {
	LanguageCode.find()
	.select("-_id -__v")
	.lean()
	.exec((err, languageCode) => {
		if(err){
			return new response().error500(res);
		}
		if(languageCode){
			return new response(languageCode, null).success(res);
		}
		return new response().notFound(res);
	})
};

exports.languageWordList = async (req, res) => {
	var lngCode = "en";
	
	const checkLanguage = await Languages.exists({Lng_code: req.params.Lng_code});

	if(checkLanguage)
	{
		lngCode = req.params.Lng_code;
	}

	const getCommonAllergies = () => {
		return CommonAllergies.find({Lng_code: lngCode},"-__v -_id").lean();
	};

	const getlanguageWords = () => {
		return Languages.find({Lng_code: lngCode},"-__v -_id").lean();
	};
	
	const getIngredientsAll = () => {
		return IngredientAll.find({Lng_code: lngCode},"-__v -_id").lean();
	};

	const getAmenities = () => {
		return Amenities.find({Lng_code: lngCode}, "-__v -_id").lean();
	};

	const getCategories = () => {
		return Category.find({Lng_code: lngCode}, "-__v -_id").lean();
	};
	
	const getIngredients = () => {
		return Ingredient.find({Lng_code: lngCode}, "-__v -_id").lean();
	}

	const array = [
		getCommonAllergies(),
		getlanguageWords(),
		getIngredientsAll(),
		getAmenities(),
		getCategories(),
		getIngredients()
	];

	try{
		const promise = await Promise.all(array);

		if(!promise){
			return new response().notFound(res);
		}
		
		var commonAllergyList = null;
		var languageWordList = null;
		var ingredientAllList = null;
		var amenitiesList = null;
		var categoryList = null;
		var ingredientList = null;

		if(promise[0].length > 0)
		{
			commonAllergyList = promise[0][0].content;
		}
		if(promise[1].length > 0)
		{
			languageWordList = promise[1][0];
		}
		if(promise[2].length > 0)
		{
			ingredientAllList = promise[2][0].content;
		}
		if(promise[3].length > 0)
		{
			amenitiesList = promise[3][0].content;
		}
		if(promise[4].length > 0)
		{
			categoryList = promise[4][0].content;
		}
		if(promise[5].length > 0)
		{
			ingredientList = promise[5][0].content;
		}
		
		return new response({
			language: languageWordList,
			content:ingredientAllList,
			commonAllergies: commonAllergyList,
			amenities: amenitiesList,
			categories: categoryList,
			ingredients:ingredientList
		},null).success(res);

	}catch(err){
		return new response().error500(res);
	}
};

exports.updatelanguageWordList = (req, res) => {

	Languages.findByIdAndUpdate(req.params.lng_id, req.body)
	.exec((err, language) => {
		if(err){
			return new response().error500(res);
		}

		if(language){
			return new response(language[0], null).success(res);
		}

		return new response().notFound(res);
	})
};