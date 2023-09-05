const User = require("../models/userModel");
const Business = require("../models/businessModel");
const Menu = require("../models/menuModel");
const Dish = require("../models/dishModel");
const Review = require("../models/reviewModel");
const DishReview = require("../models/dishReviewModel");
const authentication = require("../middleware/authentication");
const response = require("../response");
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body } = require("express-validator");
const { populate } = require("../models/userModel");
const ObjectId = require('mongoose').Types.ObjectId;
const rateLimit = require('../middleware/rateLimit');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-handlebars');

dotenv.config();
const saltRounds = 10;

const colorHex = "#ff836d";
const titleColorHex = "#ff6347";
const buttonColorHex = "#ff6347";
const logoUrl = "https://dinngu-logo.s3.eu-central-1.amazonaws.com/dinnguLogo3.png"

let mailerConfig = {    
	host: process.env.HOST,
	secure: true,
	secureConnection: false,
	tls: {
		ciphers:'SSLv3'
	},
	requireTLS:true,
	port: process.env.MAIL_PORT,
	auth: {
			user: "no-reply@dinngu.com",
			pass: process.env.PASS
	}
};

capitalizeLetter = (letter) => letter.charAt(0).toUpperCase() + letter.slice(1);

//İşletmeleri ve menülerini görecek normal kullanıcı kayıtı
exports.createUser = (req,res) => {

	const {
		password,
		name,
		surname,
		email,
	} = req.body;
	
	bcrypt.hash(password, saltRounds).then((hash) => {
		let user = new User();
		user.password = hash;
		user.name = capitalizeLetter(name);
		user.surname = capitalizeLetter(surname);
		user.email = email;

		user.save((err) => {
			if(err){
				return new response(null,err).error500(res);
			}
			jwt.sign(
				{
					userEmail : email
				},
				{
					key: process.env.SECRET, passphrase: process.env.PASSPHRASE
				},{
					algorithm: "RS256",
					expiresIn : "365d"
				},
				(err, token) => {
					if(err){
						return new response().error500(res);
					}
					if(token){
						const message1 = "You have one last step left to join our family.";
						const message2 = "Press the button below to activate your account now";
						const title = "Welcome";
						const buttonText = "Activate";

						const url = `https://dinngu.com/confirmation/activate?token=${token}`;

						let transporter = nodemailer.createTransport(mailerConfig);
						
						transporter.use('compile', hbs({
							viewEngine: {
								extName: '.hbs',
								partialsDir: 'views',
								layoutsDir: 'views',
								defaultLayout: ''
							},
							viewPath: 'views'
						}));

						let mailOptions = {
							from: mailerConfig.auth.user,
							to: email,
							subject: 'Activation',
							template: "index",
							context:{
								url : url,
								message1: message1,
								message2: message2,
								title: title,
								buttonText: buttonText,
								colorHex:colorHex,
								titleColorHex: titleColorHex,
								buttonColorHex: buttonColorHex,
								logoUrl : logoUrl
							}
						};

						transporter.sendMail(mailOptions, function (error) {
								if (error) {
									return new response().error500(res);
								} else {
									return new response().success(res);
								}
						});
					}
				}
			);
		});
	});
};

exports.activateAccount = (req,res) => {
	const token = req.body.token;

	jwt.verify(token, process.env.NOT_SECRET, (err, decoded) => {
		if(err){
			return res.status(401).json({errors: [{msg: "The activation link has expired"}]});
		}
		if(decoded){
			let userEmail = decoded.userEmail;

			User.updateOne(
				{email: userEmail},
				{isActivated: true},
				(err, user) => {
					if(err){
						return new response(null, err).error500(res);
					}
					if(user.nModified !== 0){
						return new response().success(res);
					}
					else{
						return new response().notFound(res);	
					}
			});
		}
	})
};

//İd göre seçilen kullanıcı bilgilerini günceller
exports.update = (req, res) => {
	User.findByIdAndUpdate(
		req.params.user_id,
		req.body,
		(err, user) => {
			if(err){
				return new response(null, err).error500(res);
			}
			if(!user){
				return new response().notFound(res);
			}
			return new response(user,null).success(res);
		});
};

//Seçilen kullanıcıyı siler
exports.delete = (req, res) => {
	User.findByIdAndDelete(req.params.user_id, (err,user) =>{
		if(err){
			return new response(null, err).error500(res);
		}
		if(!user){
			return new response().notFound(res);
		}
		return new response().success(res);
	});
};

//Kullanıcıları listeler
exports.list = (req, res) => {

	User.find({})
	.lean()
	.exec((err, users) => {
		if(err){
			new response(null, err).error500(res);
		}
		if(users){
			return new response(users, null).success(res);
		}
		else {
			return new response().notFound(res);
		}
	}); 
};

//Kullanıcıyı İdye göre bulur ve gösterir
exports.getById = (req,res) => {
	User.findById(req.params.user_id)
	.lean()
	.exec((err, user) => {
		if(err){
			return new response().error500(res);
		}
		if(user){
			return new response(user, null).success(res);
		}

		if(!user){
			return new response().notFound(res);
		}
	});
};

//Kullanıcının doğruluğunun kontrolünü sağlar
exports.login = async (req, res) => {
	const ipAddr = req.ip;
	const {email, password} = req.body;
	const usernameIPkey = rateLimit.getUsernameIPkey(email, ipAddr);

	const [resUsernameAndIP, resSlowByIP] = await Promise.all([
    rateLimit.limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
    rateLimit.limiterSlowBruteByIP.get(ipAddr),
  ]);

	let retrySecs = 0;

	if (resSlowByIP !== null && resSlowByIP.consumedPoints > rateLimit.maxWrongAttemptsByIPperDay) {
    retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
  } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > rateLimit.maxConsecutiveFailsByUsernameAndIP) {
    retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
  }

	if(retrySecs > 0) {
		res.set('Retry-After', String(retrySecs));
    res.status(429).send({errors: [{msg: `Retry-After ${String(retrySecs)}`}]});
	}else {

		const authResult = await authentication.checkUser(email, password);

		if(!authResult.isLoggin) {
			try {
				const promises = [rateLimit.limiterSlowBruteByIP.consume(ipAddr)];
	
				if(authResult.exists)
				{
					promises.push(rateLimit.limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey));
				}
	
				await Promise.all(promises);

				res.status(400).send({errors: [{msg: "Email or Password is wrong!"}]});
			} catch (rlRejected) {
				if (rlRejected instanceof Error) {
					throw rlRejected;
				} else {
					res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
					res.status(429).send({errors: [{msg: `Retry-After ${String(retrySecs)}`}]});
				}
			}
		}
	
		if(authResult.isLoggin) {
			if(authResult.isActivated == false){
				res.status(400).send({ errors: [{ msg: "Account is not activated!" }] });
			}
			else{
				if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
					// Reset on successful authorisation
					await rateLimit.limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
				}
				
				jwt.sign(
					{
						userId : authResult.user._id
					},
					{
						key: process.env.SECRET, passphrase: process.env.PASSPHRASE
					},{
						algorithm: "RS256",
						expiresIn : "24h"
					},
					(err, token) => {
						if(err){
							return new response().error500(res);
						}
						if(token){
							const name = `${authResult.user.name} ${authResult.user.surname}`
							const id = authResult.user._id;
							return new response({id, name, token}, null).success(res);
						}
					}
				);
			}	
		}
	}
};

//Sistemde kullanıcı emailinin olup olmadığını kontrol eder
exports.findByEmail = (req, res) => {
	const email = req.body.email;

	User.findOne({email: email},'email', (err, user) => {
		if(err){
			return new response().error500(res);
		}
		if(user){
			jwt.sign(
				{
					userEmail : email
				},
				{
					key: process.env.SECRET, passphrase: process.env.PASSPHRASE
				},{
					algorithm: "RS256",
					expiresIn : "24h"
				},
				(err, token) => {
					if(err){
						return new response().error500(res);
					}
					if(token){
						const message1 = "Please press the button below to reset your password.";
						const message2 = "This link will expire within 24 hours.";
						const title = "Reset Password";
						const buttonText = "Reset";
						

						const url = `https://dinngu.com/forgot/reset?token=${token}`;

						let transporter = nodemailer.createTransport(mailerConfig);

						transporter.use('compile', hbs({
							viewEngine: {
								extName: '.hbs',
								partialsDir: 'views',
								layoutsDir: 'views',
								defaultLayout: ''
							},
							viewPath: 'views'
						}));

						let mailOptions = {
							from: mailerConfig.auth.user,
							to: email,
							subject: 'Reset Password',
							template: "index",
							context:{
								url : url,
								message1: message1,
								message2: message2,
								title: title,
								buttonText: buttonText,
								colorHex: colorHex,
								titleColorHex: titleColorHex,
								buttonColorHex: buttonColorHex,
								logoUrl : logoUrl
							}
						};

						transporter.sendMail(mailOptions, function (error) {
							if (error) {
								return new response().error500(res);
							} else {
								return new response().success(res);
							}
						});
					}
				}
			);
			
		}
		else {
			return res.status(404).json({errors:[{msg:"There is no such email"}]});
		}
	}).lean();
};

//Kullanıcının yeni şifre almasını sağlar
exports.forgotPassword = (req, res) => {
	const {password, token} = req.body;
	
	jwt.verify(token, process.env.NOT_SECRET, (err, decoded) => {
		if(err){
			return res.status(401).json({ error: {errors: [{msg: "The activation link has expired"}]}});
		}
		if(decoded){
			let userEmail = decoded.userEmail;

			bcrypt.hash(password, saltRounds, (error,hash) => {
				if(error)
				{
					return new response(null, err).error500(res);
				}
				User.updateOne(
					{email: userEmail},
					{password: hash},
					(err, user) => {
						if(err){
							return new response(null, err).error500(res);
						}
						if(user.nModified !== 0){
							return new response().success(res);
						}
						else{
							return new response().notFound(res);	
						}
				});
			})
		}
	})
};

//Kullanıcı sisteme giriş yaptıktan sonra şifresini değiştirmek isterse
//Eski şifresi sorar, onay durumunda yeni şifre oluşturur
exports.changePassword = (req, res) => {
	const {password, newPassword} = req.body;
	
	User.findById(req.params.user_id, (err, user) => {
		if(err){
			return new response().error500(res);
		}
		if(user){
			bcrypt.compare(password, user.password,(err, result) => {
				if(result){
					bcrypt.hash(newPassword, saltRounds).then(hash => {
						User.findByIdAndUpdate(
							req.params.user_id,
							{password: hash},
							(err, user) => {
								if(err){
									return new response(null, err).error500(res);
								}
								if(user.nModified !== 0){
									return new response().success(res);
								}
								else{
									return new response().notFound(res);	
								}
							});
					});
				}
				else{
					return res.json({Message: 'passwords do not match'});
				}
			});
		};
	});
};

exports.listUserReviews = (req, res) => {
	Review.find()
	.populate({
		path: 'business_id',
		select:'name'
	})
	.where({user_id: req.params.user_id})
	.lean()
	.exec((err, ratings) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(ratings){
			return new response(ratings,null).success(res);
		}
		if(!ratings){
			return new response().notFound(res);
		}
	})
};

exports.listUserDishReviews = (req, res) => {

	DishReview.find()
	.populate({
		path:'business_id',
		select: 'name'
	})
	.where({user_id: req.params.user_id})
	.lean()
	.exec((err, ratings) => {
		if(err){
			return new response(null, err).error500(res);
		}
		if(ratings){
			return new response(ratings,null).success(res);
		}
		if(!ratings){
			return new response().notFound(res);
		}
	})
}

exports.deleteReview = async (req, res) => {
	const id = req.params.review_id;

	try{
		const deletionResult = await Review.findByIdAndDelete(id)
		.select("business_id isApproved")
		.lean()
		.exec();

		if(deletionResult){
			const isApproved = deletionResult.isApproved;
			let nonApprovedCount = 0;

			if(!isApproved){
				nonApprovedCount = -1;
			}

			const reviews = await Review.find(
				{"business_id":deletionResult.business_id, isApproved: true}
			)
			.limit(5)
			.select("ratingValue text createdTime isApproved")
			.lean()
			.exec();

			const totalApprovedReview = await Review.countDocuments({
				business_id: ObjectId(deletionResult.business_id), isApproved: true
			}).exec();

			const totalApprovedDishReview = await DishReview.countDocuments({
				business_id: ObjectId(deletionResult.business_id), isApproved: true
			}).exec();

			let review_count = totalApprovedDishReview + totalApprovedReview;

			const result = await Business.updateOne({"_id":deletionResult.business_id}, {
				"reviews":reviews, 
				"review_count":review_count,
				$inc: {"nonApprovedCount": nonApprovedCount}
			})
			.lean()
			.exec();

			if(result){
				return new response().success(res);
			}
			else{
				return new response().notFound(res);
			}
		}
	}catch(err){
		return new response().error500(res);
	}
};

exports.deleteDishReview = async (req, res) =>{
	const id = req.params.review_id;

	try{
		const deletionResult = await DishReview.findByIdAndDelete(id)
		.select("business_id menu_id sub_menu_id dish_id")
		.lean()
		.exec();

		if(deletionResult){
			const{business_id, menu_id, sub_menu_id, dish_id} = deletionResult;
			const isApproved = deletionResult.isApproved;
			let nonApprovedCount = 0;

			if(!isApproved){
				nonApprovedCount = -1;
			}

			const reviews = await DishReview.find(
				{
					"business_id":business_id,
					"menu_id": menu_id,
					"sub_menu_id":sub_menu_id,
					"dish_id":dish_id,
					isApproved: true
				}
			)
			.limit(5)
			.select("ratingValue text createdTime isApproved")
			.lean()
			.exec();

			const totalApprovedReview = await Review.countDocuments({
				business_id: ObjectId(deletionResult.business_id), isApproved: true
			}).exec();

			const totalApprovedDishReview = await DishReview.countDocuments({
				business_id: ObjectId(deletionResult.business_id), isApproved: true
			}).exec();

			let review_count = totalApprovedDishReview + totalApprovedReview;

			const result = await Business.updateOne({"_id":deletionResult.business_id}, {
				"reviews":reviews, 
				"review_count":review_count,
				$inc: {"nonApprovedCount": nonApprovedCount}
			})
			.lean()
			.exec();

			if(result){
				return new response().success(res);
			}
			else{
				return new response().notFound(res);
			}
		}
	}catch(err){
		return new response().error500(res);
	}
}