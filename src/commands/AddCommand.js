const CommandHandler = require('./CommandHandler');

class AddCommand extends CommandHandler {
    async handle(msg, match) {
        const text = match[1];
        
        const parts = text.split(' ');
        let userCategory = '';
        let url, description;

        if (parts.length >= 3 && !parts[0].startsWith('http')) {
            userCategory = parts[0];
            url = parts[1];
            description = parts.slice(2).join(' ');
        } else if (parts.length >= 2) {
            url = parts[0];
            description = parts.slice(1).join(' ');
        } else {
            return 'Usage: /add [category] [url] [description] OR /add [url] [description]';
        }

        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        try {
            const result = await this.resourceService.addResource(url, description, msg.from.id, userCategory);
            return result.message;
        } catch (error) {
            console.error('Add error:', error);
            return '❌ Error adding resource. It might already exist.';
        }
    }
}

module.exports = AddCommand;
