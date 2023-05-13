const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const { DeployCommands } = require('./deploy-commands');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
] });
const fs = require('fs');
require('colors');

(async () => {
    await DeployCommands();

    // Tüm komutları işleyin
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js')); 
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }

    // Tüm komutları işleyin
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    }

    let commandNameLength = 0;
    for (const command of client.commands) {
        if (command[0].length > commandNameLength) {
            commandNameLength = command[0].length;
        }
    }

    for (const command of client.commands) {
        console.log(`[COMMAND] ${command[0].padEnd(commandNameLength)} | ${'Loaded!'.green}`.gray); 
    }

    if (!fs.existsSync('./errors')) {
        fs.mkdirSync('./errors');
    }

    if (!fs.existsSync('./database')) {
        fs.mkdirSync('./database');
    }
 
    client.login(token); // Discord Giriş
})();