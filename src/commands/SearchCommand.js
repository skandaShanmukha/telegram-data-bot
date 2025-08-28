const CommandHandler = require('./CommandHandler');

class SearchCommand extends CommandHandler {
    async handle(msg, match) {
        const query = match[1].toLowerCase();
        
        try {
            const resources = await this.resourceService.searchResources(query);
            
            if (!resources.length) {
                return `No results found for: ${query}`;
            }

            let response = `Search results for "${query}":\n\n`;
            resources.forEach((resource, index) => {
                response += `${index + 1}. [${resource.category}] ${resource.description}\n${resource.url}\n\n`;
            });

            return response;
        } catch (error) {
            return '❌ Error searching resources';
        }
    }
}

module.exports = SearchCommand;
