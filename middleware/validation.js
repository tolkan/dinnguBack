const {check, validationResult} = require('express-validator');
const XRegExp = require("xregexp");
const User = require('../models/userModel');
const BusinessUser = require("../models/businessUserModel");

//Girilen bilgileri kontrol eder eğer hata varsa hata mesajı döndürür
exports.validationResults = (req, res, next) => {
	let errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(422).json({ errors: errors.array() });
	}
	next();
};

exports.denemeValidation = [
	check("email").trim().matches(XRegExp("^[\\p{L}\\d./:,;-]+(?:\\s[\\p{L}\\d./:,;-]+)*$"))
];

exports.userIdValidation = [
	check('user_id').escape().trim()
];

exports.emailValidation = [
	check('email').not().isEmpty().withMessage('Enter Email').bail().trim().isEmail().withMessage('Email is not valid').bail()
	.normalizeEmail()
];

//Girilen şifrenin standartlara uygunluğunu kontrol eder
exports.passwordValidation = [
	check('password').not().isEmpty().withMessage('Enter Password').bail().isLength({min:8, max: 32})
	.withMessage('Password must be at least 8 characters').bail().matches(/^[\s\d\w\u0600-\u06FFs_+=:;!@#$%^&*()+<>,.\/\/-]{8,32}$/)
];

exports.businessIdValidation = [
	check('business_id').escape().trim()
];

exports.businessAliasValidation = [
	check('alias').escape().trim()
];

//Normal kullanıcının kayıt olurken girdiği bilgileri kontrol eder
exports.createUserValidation = [
	check('name').not().isEmpty().withMessage('Enter Name').bail().isLength({min:2, max:50})
	.withMessage('Name must have more than 2 characters').bail().trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Name must contain only letters'),
	check('surname').not().isEmpty().withMessage('Enter Surname').bail().isLength({min:2, max:50})
	.withMessage('Surname must have more than 2 characters').bail().trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Surname must contain only letters'),
	check('email').not().isEmpty().withMessage('Enter Email').bail().isLength({min:5, max:50})
	.withMessage('Email must be at least 5 characters').isEmail().withMessage('Email is not valid').bail()
	.normalizeEmail().trim().custom((value, {req}) => {
		return new Promise((resolve, reject) => {
			User.findOne({email:req.body.email}, (err, user) => {
				if(err) {
					reject(new Error('Server Error'))
				}
				if(Boolean(user)) {
					reject(new Error('E-mail already in use'))
				}
				resolve(true)
			});
		});
	}),
	check('password').not().isEmpty().withMessage('Enter Password').bail().isLength({min:8, max: 32})
	.withMessage('Password must be at least 8 characters').bail().trim().matches(/^[\s\d\w\u0600-\u06FFs_+=:;!@#$%^&*()+<>,.\/\/-]{8,32}$/)
	.withMessage('Password must contain only a-zA-Z0-9!@#$%^&* ')
];

//İşletme sahibi kullanıcının kayıt olurken girdiği bilgileri kontrol eder
exports.createBusinessValidation = [
	check('name').not().isEmpty().withMessage('Enter Name').bail().isLength({min:2, max:50})
	.withMessage('Name must have more than 2 characters').bail().trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Name must contain only letters'),
	check('surname').not().isEmpty().withMessage('Enter Surname').bail().isLength({min:2, max:50})
	.withMessage('Surname must have more than 2 characters').bail().trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Surname must contain only letters'),
	check('password').not().isEmpty().withMessage('Enter Password').isLength({min:8, max: 32})
	.withMessage('Password must be at least 8 characters').matches(/^[\s\d\w\u0600-\u06FFs_+=:;!@#$%^&*()+<>,.\/\/-]{8,32}$/)
	.withMessage('Password must contain only a-zA-Z0-9!@#$%^&* '),
	check('email').not().isEmpty().withMessage('Enter Email').trim().isLength({min:5, max:50})
	.withMessage('Email must be at least 5 characters').bail().isEmail().withMessage('Email is not valid').bail()
	.custom((value, {req}) => {
		return new Promise((resolve, reject) => {
			BusinessUser.findOne({email:req.body.email}, (err, user) => {
				if(err) {
					reject(new Error('Server Error'))
				}
				if(Boolean(user)) {
					reject(new Error('E-mail already in use'))
				}
				resolve(true)
			});
		});
	}),
	check('phone').not().isEmpty().withMessage('Enter Phone').bail().trim().isLength({min:3,max:14})
	.withMessage('Phone must be at least 3 characters').bail().isNumeric({no_symbols:false}).withMessage('Phone is not valid').bail()
	.whitelist('0-9+'),
	check('business_name').not().isEmpty().withMessage('Enter Business Name').bail().trim().isLength({min:1, max: 100})
	.withMessage("Business name must be least than 100 characters").matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Business name must contain only letters and numbers'),
	check('business_phone').optional({checkFalsy:true}).trim().isLength({min:3,max:14}).withMessage('Phone must be at least 3 characters').bail()
	.isNumeric({no_symbols:false}).withMessage('Phone is not valid').bail(),
	check('site_url').optional({checkFalsy:true}).trim().isURL().withMessage('Site url is not valid').trim(),
	check('mail').optional({checkFalsy:true}).trim().isLength({min:5, max:50}).withMessage('Email must be between 5 and 100 characters')
	.isEmail().withMessage('Email is not valid').bail().normalizeEmail(),
	check('location.address1').not().isEmpty().withMessage('Enter Address 1').bail().trim().matches(XRegExp("^[\\p{L}\\d./:,;-]+(?:\\s[\\p{L}\\d./:,;-]+)*$"))
	.withMessage('Address1 is not valid'),
	check('location.address2').optional({checkFalsy:true}).bail().trim().matches(XRegExp("^[\\p{L}\\d./:,;-]+(?:\\s[\\p{L}\\d./:,;-]+)*$")).withMessage('Address2 is not valid'),
	check('location.city').not().isEmpty().withMessage('Enter City').bail().trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d./:,;-]+)*$"))
	.withMessage('City is not valid').bail(),
	check('location.zip_code').not().isEmpty().withMessage('Enter Zip Code').bail().trim().isPostalCode("any")
	.withMessage('Postal Code is not valid').bail(),
	check('location.country').not().isEmpty().withMessage('Enter Coutry').bail().trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Country is not valid').bail().whitelist("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"),
	check('location.state').optional({checkFalsy:true}).trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('State is not valid').bail().whitelist("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$").trim()
];

//Menü oluştururken girilen bilgileri kontrol eder
exports.menuValidation = [
	check('menu[*].sub_menu[*].name').optional({checkFalsy:true}).trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Sub Menu name is not valid'),
	check('menu[*].sub_menu[*].dish[*].name').optional({checkFalsy:true}).trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Dish name is not valid'),
	check('menu[*].sub_menu[*].dish[*].price.value').optional({checkFalsy:true}).isNumeric()
	.withMessage('Dish price is not valid').bail().trim(),
	check('menu[*].sub_menu[*].dish[*].price.currency').optional({checkFalsy:true}).isLength({min:1, max:3})
	.withMessage('Price currency must be between 1 and 3').bail().trim(),
	check('menu[*].sub_menu[*].dish[*].photo').optional({checkFalsy:true}).isURL()
	.withMessage('Dish image url is not valid').bail().trim(),
	check('menu[*].sub_menu[*].dish[*].ingredient[*].*').optional({checkFalsy:true}).trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
	.withMessage('Ingredient is not valid'),
];

//Normal kullanıcı bilgileri güncellenirken yeni girdileri kontrol eder
exports.updateUserValidation = [
	check('name').optional({checkFalsy:true}).trim().isLength({min:2, max:50}).withMessage('Name must have more than 2 characters').bail()
	.matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$")).withMessage('Name must contain only letters(a-zA-Z'),
	check('surname').optional({checkFalsy:true}).trim().isLength({min:2, max:50}).withMessage('Surname must have more than 2 characters').bail()
	.matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$")).withMessage('Surname must contain only letters(a-zA-Z'),
	check('email').optional({checkFalsy:true}).trim().isLength({min:5, max:50}).withMessage('Email must be at least 5 characters').bail()
	.isEmail().withMessage('Email is not valid').bail().normalizeEmail()
	.custom((value, {req}) => {
		return new Promise((resolve, reject) => {
			User.findOne({email:req.body.email}, (err, user) => {
				if(err) {
					reject(new Error('Server Error'))
				}
				if(Boolean(user)) {
					reject(new Error('E-mail already in use'))
				}
				resolve(true)
			});
		});
	}),
	check('phone').optional({checkFalsy:true}).trim().isLength({min:3,max:14}).withMessage('Phone must be at least 3 characters').bail()
	.isNumeric({no_symbols:false}).withMessage('Phone is not valid').bail()
];

//İşletme sahibi kullanıcının bilgileri güncellenirken yeni girdileri kontrol eder
exports.addBusinessValidation = [
	check('business_name').not().isEmpty().withMessage("Enter Business Name").bail().isLength({min:1, max: 100}).bail().trim().matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
		.withMessage('Business name must contain only letters'),
	check('location.address1').not().isEmpty().withMessage('Enter Address 1').bail().trim()
		.matches(XRegExp("^[\\p{L}\\d./:,;-]+(?:\\s[\\p{L}\\d./:,;-]+)*$")).withMessage('Address1 is not valid'),
	check('location.address2').optional({checkFalsy:true}).bail().trim()
		.matches(XRegExp("^[\\p{L}\\d./:,;-]+(?:\\s[\\p{L}\\d./:,;-]+)*$")).withMessage('Address2 is not valid'),
	check('location.city').not().isEmpty().withMessage('Enter City').bail().trim()
		.matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$")).withMessage('City is not valid').bail(),
	check('location.zip_code').not().isEmpty().withMessage('Enter Zip Code').bail().isPostalCode("any")
		.withMessage('Postal Code is not valid').bail().trim().whitelist(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$")),
	check('location.country').not().isEmpty().withMessage('Enter Coutry').bail().trim()
		.matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$")).withMessage('Country is not valid').bail(),
	check('location.state').optional({checkFalsy:true}).trim()
		.matches(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$")).withMessage('State is not valid').bail()
];

exports.businessPasswordValidation = [
	check('password').not().isEmpty().withMessage('Enter Password').bail().trim()
		.matches(/^[\s\d\w\u0600-\u06FFs_+=:;!@#$%^&*()+<>,.\/\/-]{8,32}$/)
		.withMessage("Password is not valid")
];

//Arama yapılması istenen kelimeyi kontrol eder
exports.searchValidation = [
	check('search').optional({nullable: true, checkFalsy: true}).trim().escape().isLength({max:65})
		.matches(XRegExp("^[\\p{L}\\d./:,;&-]+(?:\\s[\\p{L}\\d./:,;&-]+)*$")),
	check('location').optional({nullable: true, checkFalsy: true}).trim().escape().isLength({max:65})
		.matches(XRegExp("^[\\p{L}\\d./:,;&-]+(?:\\s[\\p{L}\\d./:,;&-]+)*$"))
];

exports.ratingValidation = [
	check('ratingValue').not().isEmpty().withMessage("Enter Rating").bail().isNumeric({no_symbols:false}),
	check('text').optional({nullable: true, checkFalsy: true}).trim().escape().isLength({max:2000})
	.withMessage("The text should not be longer than 2000 characters!")
	.whitelist(XRegExp("^[\\p{L}\\d]+(?:\\s[\\p{L}\\d]+)*$"))
];
