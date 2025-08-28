const CommandHandler = require('./CommandHandler');

class JobsCommand extends CommandHandler {
    async handle(msg, match) {
        try {
            const activeJobs = await this.resourceService.getAllActiveJobs();
            
            if (activeJobs.length === 0) {
                return '📭 No active job postings available.\n\nUse /job to post a new job opportunity.';
            }

            let response = `📋 ACTIVE JOB POSTINGS (${activeJobs.length}):\n\n`;
            
            activeJobs.forEach((job, index) => {
                response += `${index + 1}. ${job.title}\n`;
                response += `   📅 ${this.formatDateRange(job.start_date, job.end_date)}\n`;
                response += `   🔗 ${job.official_url}\n`;
                response += `   📝 ${job.description}\n\n`;
            });

            response += `💡 Use /job to add new job postings`;

            return response;
        } catch (error) {
            console.error('Jobs command error:', error);
            return '❌ Error retrieving job postings';
        }
    }

    formatDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `${start.getDate()} ${start.toLocaleString('en-IN', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('en-IN', { month: 'short' })} ${end.getFullYear()}`;
    }
}

module.exports = JobsCommand;
