const CommandHandler = require('./CommandHandler');

class JobsCommand extends CommandHandler {
    async handle(msg, match) {
        try {
            console.log('📋 Jobs command received from user:', msg.from.id);
            
            const activeJobs = await this.resourceService.getAllActiveJobs();
            console.log('Active jobs returned:', activeJobs.length);
            
            if (activeJobs.length === 0) {
                // Let's check if there are any jobs at all
                const allJobs = await this.resourceService.getAllJobs();
                console.log('All jobs in DB:', allJobs.length);
                
                if (allJobs.length > 0) {
                    return `📭 No active job postings found, but there are ${allJobs.length} total jobs.\n\nSome jobs may have expired. Use /job to post a new job opportunity.`;
                }
                
                return '📭 No job postings available.\n\nUse /job to post a new job opportunity.';
            }

            let response = `📋 ACTIVE JOB POSTINGS (${activeJobs.length}):\n\n`;
            
            activeJobs.forEach((job, index) => {
                response += `${index + 1}. ${job.title}\n`;
                response += `   📅 ${this.formatDateRange(job.start_date, job.end_date)}\n`;
                response += `   🔗 ${job.official_url}\n`;
                response += `   📝 ${job.description}\n\n`;
            });

            response += `💡 Use /job to add new job postings`;
            
            console.log('Sending jobs response with', activeJobs.length, 'jobs');
            return response;
        } catch (error) {
            console.error('Jobs command error:', error);
            return '❌ Error retrieving job postings: ' + error.message;
        }
    }

    formatDateRange(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const now = new Date();
            
            let range = `${start.getDate()} ${start.toLocaleString('en-IN', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('en-IN', { month: 'short' })} ${end.getFullYear()}`;
            
            // Add status indicator
            if (end < now) {
                range += ' (EXPIRED)';
            } else if (start > now) {
                range += ' (UPCOMING)';
            } else {
                range += ' (ACTIVE)';
            }
            
            return range;
        } catch (e) {
            return 'Invalid date';
        }
    }
}

module.exports = JobsCommand;
