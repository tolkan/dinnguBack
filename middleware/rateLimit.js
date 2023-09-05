const redis = require('redis');
const dotenv = require('dotenv');
const { RateLimiterRedis } = require('rate-limiter-flexible');

dotenv.config();

const redisClient = redis.createClient({
  enable_offline_queue: false,
	//password: process.env.PASSWORD
});

const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByUsernameAndIP = 5;

exports.getUsernameIPkey = (username, ip) => `${username}_${ip}`;

exports.limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_fail_ip_per_day',
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 1, // Block for 1 day, if 100 wrong attempts per day
});

exports.limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_fail_consecutive_username_and_ip',
  points: maxConsecutiveFailsByUsernameAndIP,
  duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
  blockDuration: 60 * 3, // Block for 1 hour
});