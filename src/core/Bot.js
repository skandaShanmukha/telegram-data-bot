const TelegramBot = require('node-telegram-bot-api');
const ResourceService = require('../services/ResourceService');
const AddCommand = require('../commands/AddCommand');
const SearchCommand = require('../commands/SearchCommand'); // Unified search

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
        this.commands.set('/search', new SearchCommand(this.resourceService)); // Unified command
    }

    registerHandlers() {
        this.bot.onText(/\/start/, (msg) => {
            this.bot.sendMessage(msg.chat.id, `Welcome! 🤖\n\nUse:\n/add [category] [url] [description] - Add resource\n/search [category or keyword] - Find resources\n\nExamples:\n/add https://example.com Python tutorial\n/search programming\n/search coding`);
        });

        this.bot.onText(/\/add (.+)/, async (msg, match) => {
            try {
                const response = await this.commands.get('/add').handle(msg, match);
                this.bot.sendMessage(msg.chat.id, response.message || response);
            } catch (error) {
                this.bot.sendMessage(msg.chat.id, '❌ Error processing /add command');
            }
        });

        this.bot.onText(/\/search(?:\s+(.+))?/, async (msg, match) => {
            try {
                const response = await this.commands.get('/search').handle(msg, match);
                this.bot.sendMessage(msg.chat.id, response);
            } catch (error) {
                this.bot.sendMessage(msg.chat.id, '❌ Error processing /search command');
            }
        });

        // Remove /ask handler since it's now part of /search
    }

    start() {
        console.log('🤖 Bot started with semantic search capabilities');
        process.on('SIGINT', () => this.shutdown());
    }

    shutdown() {
        console.log('🛑 Shutting down gracefully...');
        process.exit(0);
    }
}

module.exports = Bot;
