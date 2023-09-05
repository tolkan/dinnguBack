const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//Kullanıcının üyelik girişinde aldığı jwt tokenın varlığını ve doğruluğunu sorgular
//Doğruysa kullanıcı bilgilerini döndürür
module.exports = (req, res, next) => {
	dotenv.config();
	const token = req.headers.authorization.split(" ")[1];
	
	jwt.verify(token, process.env.NOT_SECRET, (err, decoded) => {
		if(err){
			return res.status(401).json(false);
		}
		if(decoded){
			req.userData = decoded;
			next();
		}
	})
};