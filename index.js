const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRouter = require('./apiRouter');

const SaltRounds = 10;

dotenv.config();
const port = process.env.PORT;
const dbCon = process.env.DB_CON;

const app = express();

//Bağlantı güvenliği sağlayıcısı 
app.use(helmet());

//Servera gelen bilgilerin formatını kontrol eder
app.use(cors());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use('/api', apiRouter);

app.listen(port, "0.0.0.0",() => {
	console.log("Server is listening.")
});

//Veritabanına bağlantıyı ve bağlantı ayarlarını oluşturur
mongoose.connect(dbCon, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

//Eğer veritabanına doğru bağlanılırsa
mongoose.connection.on('connected', () => {
	console.log('Connected to mongo instance');
});

//Eğer veritabanı bağlantısı sıransında hata oluşursa
mongoose .connection.on('error', (err) => {
	console.error('Error connecting to mongo', err);
});