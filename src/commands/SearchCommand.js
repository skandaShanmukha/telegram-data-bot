const CommandHandler = require('./CommandHandler');

class SearchCommand extends CommandHandler {
    async handle(msg, match) {
        const query = match[1] ? match[1].toLowerCase().trim() : '';
        
        if (!query) {
            try {
                const categories = await this.resourceService.getAllCategories();
                if (categories.length === 0) {
                    return 'No categories available yet. Use /add to add resources first.';
                }
                
                let response = `📂 Available categories:\n${categories.map(cat => `• ${cat}`).join('\n')}\n\n`;
                response += `💡 Usage examples:\n/search programming\n/search freecodecamp\n/search learn\n\n`;
                response += `Or use /search without query to see recent resources.`;
                
                return response;
            } catch (error) {
                return '❌ Error retrieving categories';
            }
        }

        try {
            const resources = await this.resourceService.semanticSearch(query);
            
            if (!resources.length) {
                // Get category suggestions
                const suggestedCats = this.resourceService.categorizer.findSemanticCategories(query);
                let response = `🔍 No results found for: "${query}"\n\n`;
                
                if (suggestedCats.length > 0) {
                    response += `💡 Did you mean:\n${suggestedCats.map(cat => `• /search ${cat}`).join('\n')}\n\n`;
                }
                
                response += `Try these popular searches:\n/search programming\n/search design\n/search free\n\nOr browse all categories with /search`;
                
                return response;
            }

            let response = `🔍 Found ${resources.length} result(s) for "${query}":\n\n`;
            resources.forEach((resource, index) => {
                response += `${index + 1}. [${resource.category}] ${resource.description}\n${resource.url}\n\n`;
            });

            // Add suggestion if few results
            if (resources.length < 3) {
                const categories = await this.resourceService.getAllCategories();
                if (categories.length > 0) {
                    response += `💡 Try also: /search ${categories[0]}`;
                }
            }

            return response;
        } catch (error) {
            console.error('Search error:', error);
            return '❌ Error searching resources. Please try again.';
        }
    }
}

module.exports = SearchCommand;
