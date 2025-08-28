const CommandHandler = require('./CommandHandler');

class AddCommand extends CommandHandler {
    async handle(msg, match) {
        const text = match[1];
        
        // Support two formats:
        // 1. /add [url] [description] (auto-categorize)
        // 2. /add [category] [url] [description] (user-defined category)
        
        const parts = text.split(' ');
        let userCategory = '';
        let url, description;

        // Check if first part looks like a URL (starts with http) or is a category
        if (parts.length >= 3 && !parts[0].startsWith('http')) {
            // Format: /add category url description
            userCategory = parts[0];
            url = parts[1];
            description = parts.slice(2).join(' ');
        } else if (parts.length >= 2) {
            // Format: /add url description
            url = parts[0];
            description = parts.slice(1).join(' ');
        } else {
            return 'Usage: /add [category] [url] [description] OR /add [url] [description]';
        }

        // Validate URL
        if (!url.startsWith('http')) {
            url = 'https://' + url; // Auto-add https if missing
        }

        try {
            const result = await this.resourceService.addResource(url, description, msg.from.id, userCategory);
            
            return `✅ Resource added to category: ${result.category}`;
        } catch (error) {
            console.error('Add error:', error);
            return '❌ Error adding resource. It might already exist.';
        }
    }
}

module.exports = AddCommand;
