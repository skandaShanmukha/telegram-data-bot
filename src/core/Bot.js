// src/core/Bot.js
const TelegramBot = require('node-telegram-bot-api');
const ResourceService = require('../services/ResourceService');
const AddCommand = require('../commands/AddCommand');
const AskCommand = require('../commands/AskCommand');
const SearchCommand = require('../commands/SearchCommand'); // Fixed import

class Bot {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: true });
    this.resourceService = new ResourceService();
    this.commands = new Map();

    this.initializeCommands();
    this.registerHandlers();
  }

  initializeCommands() {
    this.commands.set('/add', new AddCommand(this.resourceService));
    this.commands.set('/ask', new AskCommand(this.resourceService));
    this.commands.set('/search', new SearchCommand(this.resourceService)); // Works with lowdb
  }

  registerHandlers() {
    this.bot.onText(/\/start/, (msg) => {
      this.bot.sendMessage(
        msg.chat.id,
        `Welcome! Use:\n/add [url] [description] - Add resource\n/ask [category] - Get resources by category\n/search [keyword] - Search across all resources`
      );
    });

    this.bot.onText(/\/add (.+)/, async (msg, match) => {
      try {
        const response = await this.commands.get('/add').handle(msg, match);
        this.bot.sendMessage(msg.chat.id, response);
      } catch (error) {
        console.error(error);
        this.bot.sendMessage(msg.chat.id, '❌ Error processing /add command');
      }
    });

    this.bot.onText(/\/ask (.+)/, async (msg, match) => {
      try {
        const response = await this.commands.get('/ask').handle(msg, match);
        this.bot.sendMessage(msg.chat.id, response);
      } catch (error) {
        console.error(error);
        this.bot.sendMessage(msg.chat.id, '❌ Error processing /ask command');
      }
    });

    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      try {
        const response = await this.commands.get('/search').handle(msg, match);
        this.bot.sendMessage(msg.chat.id, response);
      } catch (error) {
        console.error(error);
        this.bot.sendMessage(msg.chat.id, '❌ Error processing /search command');
      }
    });
  }

  start() {
    console.log('🤖 Bot started with OOP/DSA architecture');
    process.on('SIGINT', () => this.shutdown());
  }

  shutdown() {
    console.log('🛑 Shutting down gracefully...');
    // No db.close() needed for lowdb
    process.exit(0);
  }
}

module.exports = Bot;

