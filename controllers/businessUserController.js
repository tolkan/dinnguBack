const BusinessUser = require("../models/businessUserModel");
const Business = require("../models/businessModel");
const Menu = require("../models/menuModel");
const Dish = require("../models/dishModel");
const Review = require("../models/reviewModel");
const DishReview = require("../models/dishReviewModel");
const authentication = require("../middleware/authentication");
const response = require("../response");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body } = require("express-validator");
const { populate } = require("../models/userModel");
const ObjectId = require('mongoose').Types.ObjectId;
const rateLimit = require('../middleware/rateLimit');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-handlebars');

let mailerConfig = {
	host: process.env.HOST,
	secure: true,
	secureConnection: false,
	tls: {
		ciphers: 'SSLv3'
	},
	requireTLS: true,
	port: process.env.MAIL_PORT,
	auth: {
		user: "no-reply@dinngu.com",
		pass: process.env.PASS
	}
};

const saltRounds = 10;

capitalizeLetter = (letter) => letter.charAt(0).toUpperCase() + letter.slice(1);

exports.createBusinessUser = (req, res) => {
	const {
		password,
		name,
		surname,
		email,
		phone,
		business_name,
		business_phone,
		site_url,
		mail,
		location,
		position,
	} = req.body;

	const businessNameAlias = business_name.split(' ').join('-');
	const cityAlias = location.city.split(' ').join('-');

	bcrypt.hash(password, saltRounds).then((hash) => {
		let businessUser = new BusinessUser();

		businessUser.password = hash;
		businessUser.name = name;
		businessUser.surname = surname;
		businessUser.email = email;
		businessUser.phone = phone;

		businessUser.save((err) => {
			if (err) {
				return new response(null, err).error500(res);
			}

			let business = new Business();
			business.business_name = business_name,
				business.business_phone = business_phone,
				business.site_url = site_url,
				business.mail = mail,
				business.location = location,
				business.userBy = businessUser._id,
				business.position = position,
				business.hours = [
					{
						day: 1
					},
					{
						day: 2
					},
					{
						day: 3
					},
					{
						day: 4
					},
					{
						day: 5
					},
					{
						day: 6
					},
					{
						day: 7
					},
				],
				business.amenities = [
					{ name: "Takes Reservations", case: false, amenity_id: 1 },
					{ name: "Offers Delivery", case: false, amenity_id: 2 },
					{ name: "Offers Takeout", case: false, amenity_id: 3 },
					{ name: "Accepts Credit Cards", case: false, amenity_id: 4 },
					{ name: "Keto Options", case: false, amenity_id: 5 },
					{ name: "Vegan Options", case: false, amenity_id: 6 },
					{ name: "Limited Vegetarian Options", case: false, amenity_id: 7 },
					{ name: "Outdoor Seating", case: false, amenity_id: 8 },
					{ name: "Upscale, Classy", case: false, amenity_id: 9 },
					{ name: "Moderate Noise", case: false, amenity_id: 10 },
					{ name: "Dressy", case: false, amenity_id: 11 },
					{ name: "Good for Groups", case: false, amenity_id: 12 },
					{ name: "Good For Kids", case: false, amenity_id: 13 },
					{ name: "Good for Dinner", case: false, amenity_id: 14 },
					{ name: "Street Parking", case: false, amenity_id: 15 },
					{ name: "Waiter Service", case: false, amenity_id: 16 },
					{ name: "Free Wi-Fi", case: false, amenity_id: 17 },
					{ name: "Full Bar", case: false, amenity_id: 18 },
					{ name: "Wheelchair Accessible", case: false, amenity_id: 19 },
					{ name: "TV", case: false, amenity_id: 20 },
					{ name: "Open to All", case: false, amenity_id: 21 },
					{ name: "Sit-down dining", case: false, amenity_id: 22 },
					{ name: "Accepts Android Pay", case: false, amenity_id: 23 },
					{ name: "Accepts Apple Pay", case: false, amenity_id: 24 },
					{ name: "Accepts Cryptocurrency", case: false, amenity_id: 25 },
					{ name: "Bike Parking", case: false, amenity_id: 26 },
					{ name: "Happy Hour", case: false, amenity_id: 27 },
					{ name: "Dogs Allowed", case: false, amenity_id: 28 },
					{ name: "Pool Table", case: false, amenity_id: 29 },
					{ name: "Smoking", case: false, amenity_id: 30 },
					{ name: "Gender Neutral Restrooms", case: false, amenity_id: 31 },
					{ name: "Good For Dancing", case: false, amenity_id: 32 },
					{ name: "By Appointment Only", case: false, amenity_id: 33 },
					{ name: "Online Booking", case: false, amenity_id: 34 },
					{ name: "Offers Military Discount", case: false, amenity_id: 35 },
					{ name: "Coat Check", case: false, amenity_id: 36 },
					{ name: "Waitlist", case: false, amenity_id: 37 },
					{ name: "Beer & Wine Only", case: false, amenity_id: 38 },
					{ name: "Garage Parking", case: false, amenity_id: 39 },
					{ name: "Valet Parking", case: false, amenity_id: 40 },
					{ name: "Private Parking Lot", case: false, amenity_id: 41 },
					{ name: "Validated Parking", case: false, amenity_id: 42 },
					{ name: "Good for Breakfast", case: false, amenity_id: 43 },
					{ name: "Good for Brunch", case: false, amenity_id: 44 },
					{ name: "Good for Lunch", case: false, amenity_id: 45 },
					{ name: "Good for Dessert", case: false, amenity_id: 46 },
					{ name: "Good for Late Night", case: false, amenity_id: 47 },
					{ name: "DJ", case: false, amenity_id: 48 },
					{ name: "Karaoke", case: false, amenity_id: 49 },
					{ name: "Juke Box", case: false, amenity_id: 50 },
					{ name: "Live", case: false, amenity_id: 51 },
					{ name: "Paid Wi-Fi", case: false, amenity_id: 52 },
				]

			business.save((err) => {

				if (err) {
					return new response(null, err).error500(res);
				}
				if (business) {
					const alias = `${businessNameAlias}-${cityAlias}-${business._id}`;

					Business.updateOne(
						{ _id: business._id },
						{ alias: alias }
					)
						.lean()
						.exec((err, modified) => {
							if (err) {
								return new response(null, err).error500(res);
							}
							jwt.sign(
								{
									userEmail: email
								},
								{
									key: process.env.SECRET, passphrase: process.env.PASSPHRASE
								}, {
								algorithm: "RS256",
								expiresIn: "365d"
							},
								(err, token) => {
									if (err) {
										return new response().error500(res);
									}
									if (token) {
										const message1 = "You have one last step left to join our family.";
										const message2 = "Press the button below to activate your account now";
										const title = "Welcome";
										const buttonText = "Activate";
										const colorHex = "#21364ae6";
										const titleColorHex = "#343a40";
										const buttonColorHex = "#343a40";
										const logoUrl = "https://dinngu-logo.s3.eu-central-1.amazonaws.com/dinnguBusinessLogo3.png"

										const url = `https://business.dinngu.com/business-confirmation/activate?token=${token}`;

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
											context: {
												url: url,
												message1: message1,
												message2: message2,
												buttonText: buttonText,
												title: title,
												colorHex: colorHex,
												titleColorHex: titleColorHex,
												buttonColorHex: buttonColorHex,
												logoUrl: logoUrl
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
				}
			});
		});
	});
};

exports.activateAccount = (req, res) => {
	const token = req.body.token;

	jwt.verify(token, process.env.NOT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).json({ errors: [{ msg: "The activation link has expired" }] });
		}
		if (decoded) {
			let userEmail = decoded.userEmail;

			BusinessUser.updateOne(
				{ email: userEmail },
				{ isActivated: true },
				(err, user) => {
					if (err) {
						return new response(null, err).error500(res);
					}
					if (user.nModified !== 0) {
						return new response().success(res);
					}
					else {
						return new response().notFound(res);
					}
				});
		}
	})
};

exports.update = (req, res) => {

	BusinessUser.findByIdAndUpdate(
		req.params.businessUser_id,
		req.body,
		{ new: true },
	)
		.lean()
		.exec((err, businessUser) => {
			if (err) {
				return new response(null, err).error500(res);
			}
			if (!businessUser) {
				return new response().notFound(res);
			}
			return new response(businessUser, null).success(res);
		})
};

//Seçilen kullanıcıyı siler
exports.delete = (req, res) => {
	const { user_id, password } = req.body;

	BusinessUser.findOne({ _id: user_id }, (err, businessUser) => {
		if (err) {
			return new response().error500(res);
		}
		if (businessUser) {
			bcrypt.compare(password, businessUser.password).then(result => {
				if (result) {
					BusinessUser.findByIdAndDelete(user_id, (err, businessUser) => {
						if (err) {
							return new response(null, err).error500(res);
						}
						if (!businessUser) {
							return new response().notFound(res);
						}
						return new response().success(res);
					});
				}
				else {
					return res.status(404).json({ errors: [{ msg: "Password is Wrong!" }] });
				}
			})
				.catch(err => {
					return new response().error500(res);
				});
		}
		else {
			return res.status(404).json({ errors: [{ msg: "User not found!" }] });
		}
	});

};

//Kullanıcıları listeler
exports.list = (req, res) => {

	BusinessUser.find({})
		.lean()
		.exec((err, businessUsers) => {
			if (err) {
				new response(null, err).error500(res);
			}
			if (businessUsers) {
				return new response(businessUsers, null).success(res);
			}
			else {
				return new response().notFound(res);
			}
		});
};

//Kullanıcıyı İdye göre bulur ve gösterir
exports.getById = (req, res) => {
	BusinessUser.findById(req.params.businessUser_id)
		.lean()
		.exec((err, businessUser) => {
			if (err) {
				return new response().error500(res);
			}
			if (businessUser) {
				return new response(businessUser, null).success(res);
			}

			if (!businessUser) {
				return new response().notFound(res);
			}
		});
};

//Kullanıcının doğruluğunun kontrolünü sağlar
exports.login = async (req, res) => {

	const ipAddr = req.ip;
	const { email, password } = req.body;

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

	if (retrySecs > 0) {
		res.set('Retry-After', String(retrySecs));
		res.status(429).send({ errors: [{ msg: `Retry-After ${String(retrySecs)}` }] });
	} else {

		const authResult = await authentication.checkBusinessUser(email, password);

		if (!authResult.isLoggin) {
			try {
				const promises = [rateLimit.limiterSlowBruteByIP.consume(ipAddr)];

				if (authResult.exists) {
					promises.push(rateLimit.limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey));
				}

				const loginPromise = await Promise.all(promises);

				if (loginPromise) {
					res.status(400).send({ errors: [{ msg: "Email or Password is wrong!" }] });
				}
			} catch (rlRejected) {
				if (rlRejected instanceof Error) {
					throw rlRejected;
				} else {
					res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
					res.status(429).send({ errors: [{ msg: `Retry-After ${String(Math.round(rlRejected.msBeforeNext / 1000)) || 1}` }] });
				}
			}
		}

		if (authResult.isLoggin) {
			if (authResult.isActivated == false) {
				res.status(400).send({ errors: [{ msg: "Account is not activated!" }] });
			}
			else {
				if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
					// Reset on successful authorisation
					await rateLimit.limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
				}
				jwt.sign(
					{
						userId: authResult.user._id
					},
					{
						key: process.env.SECRET, passphrase: process.env.PASSPHRASE
					}, {
					algorithm: "RS256",
					expiresIn: "24h"
				},
					(err, token) => {
						if (err) {
							return new response().error500(res);
						}
						if (token) {
							const name = `${authResult.user.name} ${authResult.user.surname}`
							const id = authResult.user._id;
							return new response({ id, name, token }, null).success(res);
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

	BusinessUser.findOne({ email: email }, 'email', (err, user) => {

		if (err) {
			return new response().error500(res);
		}
		if (user) {
			jwt.sign(
				{
					userEmail: email
				},
				{
					key: process.env.SECRET, passphrase: process.env.PASSPHRASE
				}, {
				algorithm: "RS256",
				expiresIn: "24h"
			},
				(err, token) => {
					if (err) {
						return new response().error500(res);
					}
					if (token) {
						const message1 = "Please press the button below to reset your password.";
						const message2 = "This link will expire within 24 hours.";
						const title = "Reset Password";
						const buttonText = "Reset Password";
						const colorHex = "#324d68";
						const titleColorHex = "#324d68";
						const buttonColorHex = "#324d68";
						const logoUrl = "https://dinngu-logo.s3.eu-central-1.amazonaws.com/dinnguBusinessLogo3.png"

						const url = `https://business.dinngu.com/business-forgot/reset?token=${token}`;

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
							context: {
								url: url,
								message1: message1,
								message2: message2,
								buttonText: buttonText,
								title: title,
								colorHex: colorHex,
								titleColorHex: titleColorHex,
								buttonColorHex: buttonColorHex,
								logoUrl: logoUrl
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
			return res.status(404).json({ errors: [{ msg: "There is no such email" }] });
		}
	}).lean();
};

//Kullanıcının yeni şifre almasını sağlar
exports.forgotPassword = (req, res) => {
	const { password, token } = req.body;

	jwt.verify(token, process.env.NOT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).json({ errors: [{ msg: "The activation link has expired" }] });
		}
		if (decoded) {
			let userEmail = decoded.userEmail;

			bcrypt.hash(password, saltRounds, (error, hash) => {
				if (error) {
					return new response(null, err).error500(res);
				}
				BusinessUser.updateOne(
					{ email: userEmail },
					{ password: hash },
					(err, user) => {
						if (err) {
							return new response(null, err).error500(res);
						}
						if (user.nModified !== 0) {
							return new response().success(res);
						}
						else {
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

	const { password, newPassword } = req.body;

	BusinessUser.findById(req.params.businessUser_id, (err, businessUser) => {
		if (err) {
			return new response().error500(res);
		}
		if (businessUser) {
			bcrypt.compare(password, businessUser.password, (err, result) => {
				if (result) {
					bcrypt.hash(newPassword, saltRounds).then(hash => {
						BusinessUser.findByIdAndUpdate(
							req.params.businessUser_id,
							{ password: hash },
							(err, businessUser) => {
								if (err) {
									return new response(null, err).error500(res);
								}
								if (businessUser.nModified !== 0) {
									return new response().success(res);
								}
								else {
									return new response().notFound(res);
								}
							});
					});
				}
				else {
					return res.json({ Message: 'passwords do not match' });
				}
			});
		};
	});
};

exports.approveReviews = async (req, res) => {
	const id = req.params.review_id;
	const { isApproved, pendingApproval } = req.body;


	try {
		const approved = await Review.findByIdAndUpdate(id)
			.set('isApproved', isApproved)
			.select("business_id")
			.lean()
			.exec();

		if (approved) {

			const reviews = await Review.find(
				{ "business_id": approved.business_id, isApproved: true }
			)
				.limit(5)
				.select("ratingValue text createdTime isApproved user_id user_name")
				.lean()
				.exec();

			if (isApproved == false) {
				await Review.deleteOne({ "_id": id }).exec();
			}

			const totalApprovedReview = await Review.countDocuments({
				business_id: ObjectId(approved.business_id), isApproved: true
			}).exec();

			const totalApprovedDishReview = await DishReview.countDocuments({
				business_id: ObjectId(approved.business_id), isApproved: true
			}).exec();

			const totalNonApprovedReview = await Review.countDocuments({
				business_id: ObjectId(approved.business_id), isApproved: false
			}).exec();

			const totalNonApprovedDishReview = await DishReview.countDocuments({
				business_id: ObjectId(approved.business_id), isApproved: false
			}).exec();

			let review_count = totalApprovedDishReview + totalApprovedReview;
			let nonApprovedCount = totalNonApprovedReview + totalNonApprovedDishReview;

			const result = await Business.updateOne({ "_id": approved.business_id }, {
				"reviews": reviews,
				"review_count": review_count,
				"nonApprovedCount": nonApprovedCount
			})
				.lean()
				.exec();

			if (result) {
				return new response().success(res);
			}
			else {
				return new response().notFound(res);
			}
		}
	} catch (err) {
		return new response().error500(res);
	}
};

exports.approveDishReviews = async (req, res) => {
	const id = req.params.review_id;
	const { isApproved, pendingApproval } = req.body;


	try {
		const approved = await DishReview.findByIdAndUpdate(id)
			.set('isApproved', isApproved)
			.select("business_id menu_id sub_menu_id dish_id ")
			.lean()
			.exec();

		if (approved) {

			const { business_id, menu_id, sub_menu_id, dish_id } = approved;

			const reviews = await DishReview.find(
				{
					"business_id": business_id,
					"menu_id": menu_id,
					"sub_menu_id": sub_menu_id,
					"dish_id": dish_id,
					isApproved: true
				}
			)
				.limit(5)
				.select("ratingValue text createdTime isApproved user_id user_name")
				.lean()
				.exec();

			if (isApproved == false) {
				await DishReview.deleteOne({ "_id": id }).exec();
			}

			const totalApprovedReview = await Review.countDocuments({
				business_id: ObjectId(approved.business_id), isApproved: true
			}).exec();

			const totalApprovedDishReview = await DishReview.countDocuments({
				business_id: ObjectId(approved.business_id), isApproved: true
			}).exec();

			const totalNonApprovedReview = await Review.countDocuments({
				business_id: ObjectId(approved.business_id), isApproved: false
			}).exec();

			const totalNonApprovedDishReview = await DishReview.countDocuments({
				business_id: ObjectId(approved.business_id), isApproved: false
			}).exec();

			let review_count = totalApprovedDishReview + totalApprovedReview;
			let nonApprovedCount = totalNonApprovedReview + totalNonApprovedDishReview;

			const result = await Business.findByIdAndUpdate(
				business_id,
				{
					"review_count": review_count,
					"nonApprovedCount": nonApprovedCount,
					$set: {
						'menu.$[m].sub_menu.$[s].dish.$[d].reviews': reviews,
						'menu.$[m].sub_menu.$[s].dish.$[d].dish_review_count': totalApprovedDishReview
					},
				},
				{
					arrayFilters: [{ 'm._id': menu_id }, { 's._id': sub_menu_id }, { 'd._id': dish_id }]
				})
				.select("_id")
				.lean()
				.exec()

			if (result) {
				return new response().success(res);
			}
			else {
				return new response().notFound(res);
			}
		}
	} catch (err) {
		return new response().error500(res);
	}
};