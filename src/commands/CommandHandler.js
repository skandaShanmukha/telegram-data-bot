class CommandHandler {
    constructor(resourceService) {
        this.resourceService = resourceService;
    }

    handle(msg, match) {
        throw new Error('Method not implemented');
    }
}

module.exports = CommandHandler;
