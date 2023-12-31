const mongoose = require('mongoose');

const schema = mongoose.Schema;

const languageSchema = new schema({
		Lng_code:String,
		sign_in:String,
		log_in:String,
		log_out:String,
    e_mail:String,
    forgot_password_:String,
    sign_up:String,
    name:String,
    surname:String,
    password:String,
		new_password_generate:String,
    search:String,
    location:String,
    search_in_all_dish:String,
		range:String,
		delete:String,
    rating:String,
    price :String,
    item_per_page:String,
    review:String,
    categories:String,
    contact_details:String,
    web_site:String,
    phone :String,
    address :String,
    sunday:String,
		monday:String,
		wednesday:String,
    tuesday:String,
    thursday:String,
    friday :String,
    saturday :String,
    amenities:String,
    business:String,
    foogu_for_bussiness:String,
    languages:String,
    allergy_List:String,
    your_cart_is_empty:String,
    close_the_cart:String,
    clean_the_cart:String,
    are_you_sure_you_want_to_clean_the_cart_:String,
    no_thanks:String,
    yes_sure:String,
    apply:String,
    business_ratings:String,
    dish_ratings:String,
    setting:String,
    edit_profile:String,
    change_password:String,
    delete_account:String,
    save_changes:String,
    new_password:String,
		are_you_sure_you_want_to_delete_the_account_:String,
		give_rating:String,
		menu:String,
		working_hours:String,
		open:String,
		close:String,
		user:String,
    user_phone:String,
    email:String,
    confirm_password:String,
    business_name:String,
    business_phone:String,
    business_web_link:String,
    business_email:String,
    country:String,
    state :String,
    city :String,
    postal_code:String,
    adresss2:String,
    i_accept:String,
    privacy_policy:String,
    user_agreement:String,
    forgot_password:String,
    update_profile:String,
    update_businesses:String,
    reviews_and_ratings:String,
    visiters_graphics:String,
    suggestions:String,
    delete_profile:String,
    businesses:String,
    add_new_business:String,
    create_business:String,
    get_QRcode:String,
    delete_business:String,
    close_the_dialog:String,
    are_you_sure_you_want_to_delete_the:String,
    menu_update:String,
    image_upload:String,
    update_images:String,
    delete_image:String,
    business_information:String,
    open_close_hours:String,
    select_a_price:String,
    update:String,
    menus:String,
    generate_a_menu:String,
    created_menus:String,
    add :String,
    add_sub_menu:String,
    edit:String,
    generate_a_sub_menu:String,
    created_sub_menus:String,
    dish_add:String,
    dish_name:String,
    please_enter_dish_name_:String,
    coins:String,
    ingredient_list:String,
    all_ingredients:String,
    search_in_all_ingredients:String,
		create_new_dish:String,
		update_dish:String,
		main_image:String,
		notWorking:String,
		working:String,
		advanced_search:String,
		current_location_not_taken:String,
		current_location:String,
		business_reviews:String,
		dish_reviews:String,
		unapproved_reviews:String,
		unapproved_dish_reviews:String,
		currency:String,
		aboutBusiness:String,
		enter_page_title_1:String,
		enter_page_text_1:String,
		enter_page_title_2:String,
		enter_page_text_2:String,
		enter_page_title_3:String,
		enter_page_text_3:String,
		main_page_title_1:String,
		main_page_text_1:String,
		main_page_title_2:String,
		main_page_text_2:String,
		main_page_title_3:String,
		main_page_text_3:String,
		main_page_title_4:String,
		main_page_text_4:String,
});

module.exports = mongoose.model('languages', languageSchema);