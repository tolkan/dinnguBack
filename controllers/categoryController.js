const response = require("../response");
const Category = require('../models/categoryModel');

//Yeni kategori oluşturur
exports.create = (req, res) => {
	let category = new Category(req.body);

	category.save((err) => {
		if(err){
			return new response(null,err).error500(res);
		}
		return new response(category, null).created(res);
	});
};

//Kategoriyi id ye göre bulur.
exports.getById = (req, res) => {
	
	Category.findById(req.params.category_id, (err, category) => {
		if(err){
			return new response().error500(res);
		}

		if(category){
			return new response(category, null).success(res);
		}

		return new response().notFound(res);
	}).lean();
};

//Kategoriyi günceller eder
exports.update = (req, res) => {

	Category.findByIdAndUpdate(
		req.params.category_id,
		req.body,{new:true},
		(err, category) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(!category){
			return new response().notFound(res);
		}
	});
};

//Kategoriyi siler
exports.delete = (req, res) => {
	
	Category.findByIdAndDelete(req.params.category_id, (err,category) =>{
		if(err){
			return new response(null, err).error500(res);
		}

		if(!category){
			return new response().notFound(res);
		}

		return new response(category, null).success(res);
	});
};

//Kategoriyi ismine göre bulur
exports.getByName = (req, res) => {
	Category.find({name:req.params.name})
	.lean()
	.exec( (err, category) => {
		if(err){
			return new response().error500(res);
		}

		if(category){
			return new response(category, null).success(res);
		}

		return new response().notFound(res)
		});
};