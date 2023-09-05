const router = require('express').Router();
const userController = require("./controllers/userController");
const businessUserController = require("./controllers/businessUserController");
const categoryController = require("./controllers/categoryController");
const businessController = require("./controllers/businessController");
const menuController = require('./controllers/menuController');
const ingredientController = require('./controllers/ingredientController');
const allergyController = require('./controllers/allergyController');
const uploadController = require('./controllers/uploadController');
const languageController = require('./controllers/languageController');
const amenitiesController = require('./controllers/amenitiesController');
const checkAuth = require('./middleware/checkAuth');
const upload = require('./services/fileUpload');
const {
	validationResults,
	userIdValidation,
	businessIdValidation,
	businessAliasValidation,
	createUserValidation,
	createBusinessValidation,
	businessPasswordValidation,
	menuValidation,
	updateUserValidation,
	addBusinessValidation,
	emailValidation,
	passwordValidation,
	searchValidation,
	ratingValidation,
} = require('./middleware/validation');

//KULLANICI KAYIT
router.route('/signup').post(createUserValidation, validationResults, userController.createUser)
router.route('/business/signup').post(createBusinessValidation,validationResults, businessUserController.createBusinessUser);
router.route('/activateAccount').put(userController.activateAccount);
router.route('/business/activateAccount').put(businessUserController.activateAccount);

//KULLANICI GİRİŞ
router.route('/login').post(emailValidation, validationResults, userController.login);
router.route('/business/login').post(emailValidation, validationResults, businessUserController.login);

//YENİ ŞİFRE ALMAK İÇİN EMAİL OYNAYI VE YENİ EMAİL GÖNDERİMİ
router.route('/forgotPassword').post(emailValidation, validationResults,userController.findByEmail);
router.route('/business/forgotPassword').post(emailValidation, validationResults,businessUserController.findByEmail);

//YENİ ŞİFRE OLUŞTURMA
router.route('/resetPassword').put(passwordValidation, validationResults,userController.forgotPassword);
router.route('/business/resetPassword').put(passwordValidation, businessIdValidation, validationResults,businessUserController.forgotPassword);

//NORMAL KULLANICI İŞLEMLERİ
router.route('/user/:user_id').get(checkAuth, userIdValidation, validationResults, userController.getById)
	.put(checkAuth, userIdValidation,validationResults,updateUserValidation, validationResults,userController.update)
	.delete(checkAuth,userIdValidation,validationResults, userController.delete);
router.route('/user/reviews/:review_id').delete(checkAuth,userController.deleteReview);
router.route('/user/dishReviews/:review_id').delete(checkAuth,userController.deleteDishReview);

//İŞLETME HESABI İŞLEMLERİ
router.route('/business/user/:businessUser_id').get(checkAuth,businessIdValidation,validationResults,businessUserController.getById)
.put(checkAuth, businessIdValidation, updateUserValidation, validationResults,businessUserController.update);
router.route('/business/changePassword/:businessUser_id').post(checkAuth,passwordValidation, businessIdValidation,validationResults,businessUserController.changePassword);
router.route('/businessUser/approveReview/:review_id').put(checkAuth, businessUserController.approveReviews);
router.route('/businessUser/approveDishReview/:review_id').put(checkAuth, businessUserController.approveDishReviews);
router.route('/business/user/deleteUser').delete(checkAuth,businessPasswordValidation,validationResults,businessUserController.delete);
router.route('/business/:business_id/reviews').get(businessIdValidation,validationResults,businessController.listReviewsByBusiness);
router.route('/business/user/:businessUser_id/businesses').get(businessIdValidation,validationResults,businessController.listByUserId);
router.route('/business/user/:businessUser_id/addBusiness').post(checkAuth,addBusinessValidation,validationResults,businessController.addBusiness);
router.route('/business/user/:businessUser_id/allReviews').get(businessController.listReviewCountByBusiness);
router.route('/reset-password').post(checkAuth,passwordValidation, userIdValidation,validationResults,userController.changePassword);

router.route('/business/:business_id').get( businessController.getBusinessById).put(checkAuth, businessIdValidation,validationResults,businessController.update)
.delete(checkAuth, businessController.delete);
router.route('/business/:business_id/menu').get(menuController.listMenusById).put(checkAuth,businessIdValidation,validationResults, menuController.changeMenuPosition);
router.route('/business/:menu_id/subMenu').get(menuController.listSubMenu);
router.route('/business/:business_id/createMenu').put(checkAuth, businessIdValidation,menuValidation, validationResults, menuController.addMenu);
router.route('/business/:business_id/newMenu').put(checkAuth, businessIdValidation,menuValidation, validationResults, menuController.addMenu);
router.route('/business/:business_id/newSubMenu').put(checkAuth, businessIdValidation,menuValidation, validationResults,menuController.addNewSubMenu);
router.route('/business/:business_id/menu/newDish').put(checkAuth,businessIdValidation,validationResults,menuController.addNewDish);

//MENU UPDATE
router.route('/business/:business_id/menu/updateMenu').put(checkAuth, businessIdValidation,menuValidation, validationResults,menuController.updateMenuName);
router.route('/business/:business_id/menu/updateSubMenu').put(checkAuth, businessIdValidation,menuValidation, validationResults,menuController.updateSubMenuName);
router.route('/business/:business_id/menu/updateDish').put(checkAuth, businessIdValidation,menuValidation, validationResults,menuController.updateDish);

//MENU DELETE
router.route('/business/:business_id/menu/deleteMenu').put(checkAuth, businessIdValidation,menuController.deleteMenu);
router.route('/business/:business_id/menu/deleteSubMenu').put(checkAuth, businessIdValidation,menuController.deleteSubMenu);
router.route('/business/:business_id/menu/deleteDish').put(checkAuth, businessIdValidation,menuController.deleteDish);


router.route('/business/:business_id/menu/changeSubMenu').put(checkAuth, businessIdValidation,menuController.changeSubMenuPosition);
router.route('/business/menu/changeDish').put(checkAuth, businessIdValidation,menuController.changeDishPosition);

router.route('/business/:business_id/selectedMenu').get(businessIdValidation,validationResults,menuController.getSelectedMenu)

//Search
router.route('/search').get(searchValidation, validationResults,businessController.search);

//RESTORANT GÖSTERME 
router.route('/:alias').get( businessController.getBusinessByAlias);
router.route('/:alias/menu').get(menuController.listMenus);
router.route('/write-review').put(checkAuth, ratingValidation, validationResults,businessController.giveReview);
router.route('/write-dish-review').put(checkAuth, ratingValidation, validationResults,menuController.giveDishReview);

//Ingredient
router.route('/ingredient/create').post(ingredientController.create);
router.route('/ingredient/:sub_id').get(ingredientController.getBySubId);

router.route('/ingredientAll/create').post(ingredientController.createAll);

router.route('/listUserRatings/:user_id').get(userIdValidation,validationResults,userController.listUserReviews);
router.route('/listUserDishRatings/:user_id').get(userIdValidation,validationResults,userController.listUserDishReviews);

//COMMON ALLERGİES
router.route('/commonAllergies').post(allergyController.createCommonAllergies);
router.route('/amenities').post(amenitiesController.createAmenities);

//BUSINESS IMAGE UPLOAD
router.route('/business/:business_id/imageUpload').post(checkAuth,businessIdValidation,validationResults,uploadController.imageUpload);

//LANGUAGE WORD LİST
router.route('/localization/:Lng_code').get(languageController.languageWordList);
router.route('/languageCodes/list').get(languageController.getLanguageCode).post(languageController.createLanguageCode);
router.route('/createLanguageWordList').post(languageController.createLanguageWordList);
router.route('/updateLanguageWordList/:lng_id').put(languageController.updatelanguageWordList);

//CATEGORY
router.route('/category').post(categoryController.create);
router.route('/category/:category_id').get(categoryController.getById).put(categoryController.update).delete(categoryController.delete);
router.route('/category/search/:name').get(categoryController.getByName);

module.exports = router;
