const TelegramBot = require('node-telegram-bot-api');
const ResourceService = require('../services/ResourceService');
const ReminderService = require('../services/ReminderService');
const AddCommand = require('../commands/AddCommand');
const SearchCommand = require('../commands/SearchCommand');
const JobCommand = require('../commands/JobCommand');
const JobsCommand = require('../commands/JobsCommand');

class Bot {
    constructor(token) {
        this.bot = new TelegramBot(token, { polling: true });
        this.resourceService = new ResourceService();
        this.reminderService = new ReminderService(this.bot, this.resourceService);
        this.commands = new Map();
        
        this.initializeCommands();
        this.registerHandlers();
    }

    initializeCommands() {
        this.commands.set('/add', new AddCommand(this.resourceService));
        this.commands.set('/search', new SearchCommand(this.resourceService));
        this.commands.set('/job', new JobCommand(this.resourceService));
        this.commands.set('/jobs', new JobsCommand(this.resourceService));
    }

    registerHandlers() {
        this.bot.onText(/\/start/, (msg) => {
            this.bot.sendMessage(msg.chat.id, `Welcome! 🤖\n\nUse:\n/add [url] [description] - Add resource\n/search [query] - Find resources\n/job [title] [url] [start] [end] [desc] - Post job\n/jobs - List all jobs`);
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

        this.bot.onText(/\/job(?:\s+(.+))?/, async (msg, match) => {
            try {
                const response = await this.commands.get('/job').handle(msg, match);
                this.bot.sendMessage(msg.chat.id, response);
            } catch (error) {
                this.bot.sendMessage(msg.chat.id, '❌ Error processing /job command');
            }
        });

        this.bot.onText(/\/jobs/, async (msg) => {
            try {
                const response = await this.commands.get('/jobs').handle(msg, []);
                this.bot.sendMessage(msg.chat.id, response);
            } catch (error) {
                this.bot.sendMessage(msg.chat.id, '❌ Error processing /jobs command');
            }
        });
    }

    start() {
        console.log('🤖 Bot started with job posting capabilities');
        this.reminderService.start();
        process.on('SIGINT', () => this.shutdown());
    }

    shutdown() {
        console.log('🛑 Shutting down gracefully...');
        this.reminderService.stop();
        process.exit(0);
    }
}

module.exports = Bot;
