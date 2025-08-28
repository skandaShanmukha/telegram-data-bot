class ReminderService {
    constructor(bot, resourceService) {
        this.bot = bot;
        this.resourceService = resourceService;
        this.reminderInterval = null;
        this.subscribedChats = new Set();
    }

    start() {
        // Send daily reminders at 6 AM
        this.reminderInterval = setInterval(() => {
            this.sendDailyReminders();
        }, 24 * 60 * 60 * 1000); // 24 hours

        // Also send immediately on start for testing
        this.sendDailyReminders();
        
        console.log('⏰ Reminder service started');
    }

    stop() {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
            this.reminderInterval = null;
        }
        console.log('⏰ Reminder service stopped');
    }

    async sendDailyReminders() {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            
            // Only send between 6 AM and 7 AM
            if (currentHour !== 6) return;

            const activeJobs = await this.resourceService.getAllActiveJobs();
            const endingSoon = await this.resourceService.getJobsEndingSoon();
            const startingSoon = await this.resourceService.getJobsStartingSoon();

            if (activeJobs.length === 0) {
                return;
            }

            let message = `⏰ DAILY JOB REMINDER\n\n`;
            
            // Jobs starting soon
            if (startingSoon.length > 0) {
                message += `🚀 STARTING SOON:\n`;
                startingSoon.forEach(job => {
                    message += `• ${job.title} - Starts: ${this.formatDate(job.start_date)}\n`;
                });
                message += `\n`;
            }

            // Jobs ending soon
            if (endingSoon.length > 0) {
                message += `⏳ ENDING SOON:\n`;
                endingSoon.forEach(job => {
                    message += `• ${job.title} - Ends: ${this.formatDate(job.end_date)}\n`;
                });
                message += `\n`;
            }

            // All active jobs
            message += `📋 ACTIVE JOB POSTINGS:\n`;
            activeJobs.forEach(job => {
                message += `• ${job.title} (${this.formatDate(job.start_date)} to ${this.formatDate(job.end_date)})\n`;
            });

            message += `\nUse /jobs to see all job details`;

            // Send to all subscribed chats (for now, we'll send to all, later we can implement subscription)
            // For now, we'll just log it. You can implement chat subscription system later.
            console.log('📤 Daily job reminder ready to send:\n', message);
            
        } catch (error) {
            console.error('Reminder service error:', error);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    subscribeChat(chatId) {
        this.subscribedChats.add(chatId);
    }

    unsubscribeChat(chatId) {
        this.subscribedChats.delete(chatId);
    }
}

module.exports = ReminderService;
