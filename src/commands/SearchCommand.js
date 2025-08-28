const CommandHandler = require('./CommandHandler');

class SearchCommand extends CommandHandler {
    async handle(msg, match) {
        const query = match[1] ? match[1].toLowerCase().trim() : '';
        
        if (!query) {
            // Show available categories if no query
            try {
                const categories = await this.resourceService.getAllCategories();
                if (categories.length === 0) {
                    return 'No categories available yet. Use /add to add resources first.';
                }
                
                return `Available categories:\n${categories.map(cat => `• ${cat}`).join('\n')}\n\nUse /search [category or keyword] to find resources.`;
            } catch (error) {
                return '❌ Error retrieving categories';
            }
        }

        try {
            const resources = await this.resourceService.semanticSearch(query);
            
            if (!resources.length) {
                return `No results found for: "${query}"\n\nTry searching with different terms or browse available categories with /search`;
            }

            let response = `🔍 Search results for "${query}":\n\n`;
            resources.forEach((resource, index) => {
                response += `${index + 1}. [${resource.category}] ${resource.description}\n${resource.url}\n\n`;
            });

            return response;
        } catch (error) {
            console.error('Search error:', error);
            return '❌ Error searching resources';
        }
    }
}

module.exports = SearchCommand;
