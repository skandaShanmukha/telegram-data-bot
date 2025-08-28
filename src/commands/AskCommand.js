const CommandHandler = require('./CommandHandler');

class AskCommand extends CommandHandler {
    async handle(msg, match) {
      try {
        if (!match[1]) {
            const categories = await this.resourceService.getAllCategories();
            
            if (!categories || categories.length === 0) {
                return 'No categories available yet. Use /add to add resources first.';
            }
            
            return `Available categories:\n${categories.map(cat => `• ${cat}`).join('\n')}\n\nUse /ask [category] to see resources.`;
        }

        const category = match[1].toLowerCase();
        const resources = await this.resourceService.getResourcesByCategory(category);
        
        if (!resources || resources.length === 0) {
            return `No resources found in category: ${category}`;
        }

        let response = `Resources in ${category} (${resources.length} total):\n\n`;
        resources.forEach((resource, index) => {
            response += `${index + 1}. ${resource.description}\n${resource.url}\n\n`;
        });

        return response;
    } catch (error) {
        console.error('AskCommand error:', error);
        return '❌ Error processing your request. Please try again.';
    }
   }
}

module.exports = AskCommand;
