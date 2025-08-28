const CommandHandler = require('./CommandHandler');

class JobCommand extends CommandHandler {
    async handle(msg, match) {
        const text = match[1];
        
        if (!text) {
            return this.showJobHelp();
        }

        // Parse job command: /job title url start_date end_date description
        const parts = text.split(' ');
        if (parts.length < 5) {
            return this.showJobHelp();
        }

        try {
            // Extract parameters (description can contain spaces)
            const title = parts[0];
            const official_url = parts[1];
            const start_date = parts[2];
            const end_date = parts[3];
            const description = parts.slice(4).join(' ');

            const result = await this.resourceService.addJob(
                title, official_url, start_date, end_date, description, msg.from.id
            );

            return result.message;
        } catch (error) {
            console.error('Job command error:', error);
            return `❌ Error adding job: ${error.message}\n\n${this.showJobHelp()}`;
        }
    }

    showJobHelp() {
        return `📋 Job Posting Usage:\n/job [title] [url] [start_date] [end_date] [description]\n\n📅 Date Format: DD-MM-YYYY (e.g., 16-07-2025)\n\nExample:\n/job IBPS_BANK https://ibps.com/ 16-07-2025 25-07-2025 Banking recruitment for clerk posts`;
    }
}

module.exports = JobCommand;
