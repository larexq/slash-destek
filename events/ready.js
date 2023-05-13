const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`[EVENT] Logged in as ${client.user.tag}`.magenta);

        client.user.setPresence({
            activities: [
                { 
                    name: 'Void ♥️',
                    type: ActivityType.Watching 
                }
            ],
            status: 'idle'
        });
    }
}