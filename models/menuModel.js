const mongoose = require('mongoose');
const Dish = require('./dishModel').schema;

const schema = mongoose.Schema;

const menuSchema = new schema({
	name:String,
	sub_menu: [{
		name: String,
		dish:[Dish]
	}]
});

module.exports = mongoose.model('menu', menuSchema);