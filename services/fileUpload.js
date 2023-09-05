const aws = require('aws-sdk');
const multer = require("multer");
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');

dotenv.config();
const s3 = new aws.S3();

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const imageFilter = (res, file, cb) => {
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
		cb(null,true);
	}
	else {
		cb (new Error('Invalid Mime Type, only JPEG or PNG'), false);
	}
};

const upload = multer({
  limits: {
    fileSize: 4194304 // 4MB
  },
  fileFilter: imageFilter,
  storage: multerS3({
    s3: s3,
    bucket: 'dinngu',
    cacheControl: 'max-age=31536000',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      const key = `${req.params.business_id}${file.originalname}`;
      cb(null, key);
    }
  })
});

module.exports = upload;