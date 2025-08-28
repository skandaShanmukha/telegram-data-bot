const Bot = require('./core/Bot');
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const bot = new Bot(token);
bot.start();
