const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalNear } = require('mineflayer-pathfinder').goals;
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const helpMessage = `
Debeloped by samir Bhuiyan AKA SamiRX69, R.Samir.Bhuiyan.A
Available commands:
- "w [message]": Send a chat message.
- "goto x z": Set a goal to go to the specified coordinates (e.g., "goto 100 200").
- "pos": Get the bot's current position.
- "afk": Start AFK mode (bot will jump continually).
- "dafk": Stop AFK mode.
- "recon": Reconnect to the server.(dont work)
- "recon@": Enable auto-reconnect to the(don't work  server (if disconnected).
- "kick": Log out from the server.
- "exit": Exit the bot.
- "help": Display this help message.
`;

const bots = [];
let afkInterval;

const createBot = (username, serverIp, serverPort) => {
    const bot = mineflayer.createBot({
        host: serverIp,
        port: serverPort,
        username: username,
    });

    bot.loadPlugin(pathfinder);

    bot.on('login', () => {
        console.log(`Bot ${username} has successfully joined the server.`);
        bot.pathfinder.setMovements(new Movements(bot, require('minecraft-data')(bot.version)));
    });

    bot.on('end', () => {
        console.log(`Bot ${username} has disconnected from the server.`);
    });

    bot.on('error', (err) => {
        console.error(`Bot ${username} encountered an error:`, err);
    });

    bot.on('chat', (username, message) => {
        if (username !== bot.username) {
            console.log(`Chat: ${username}: ${message}`);
        }
    });

    bot.on('message', (jsonMsg) => {
        try {
            const msg = JSON.parse(jsonMsg);
            if (msg.text) {
                if (username === bots[0].username) {
                    console.log(`Message: ${msg.text}`);
                }
            }
        } catch (e) {
            console.log(`Chat Message: ${jsonMsg}`);
        }
    });

    bot.on('goal_reached', () => {
        console.log(`Goal reached for bot ${username}!`);
    });

    bot.on('path_update', (results) => {
        if (results.status === 'no_path') {
            console.log(`No path to the goal could be found for bot ${username}.`);
        } else if (results.status === 'timeout') {
            console.log(`Pathfinder timeout for bot ${username}. Consider increasing the timeout setting.`);
        }
    });

    bots.push(bot);
};

const setupConsoleInput = () => {
    rl.question('Console Input: ', (input) => {
        if (input.startsWith('w ') || input.startsWith('W ')) {
            bots.forEach(bot => {
                bot.chat(input.substring(2));
            });
            console.log(`Chat: Sent message to all bots: ${input.substring(2)}`);
        } else if (input.startsWith('goto ')) {
            const coordinates = input.substring(5).split(' ');
            if (coordinates.length === 2) {
                const x = parseInt(coordinates[0]);
                const z = parseInt(coordinates[1]);
                if (!isNaN(x) && !isNaN(z)) {
                    bots.forEach(bot => {
                        bot.pathfinder.setGoal(new GoalNear(x, bot.entity.position.y, z));
                        console.log(`Goal set for bot ${bot.username}: Going to ${x}, ${z}`);
                    });
                } else {
                    console.log('Invalid coordinates. Usage: goto x z');
                }
            } else {
                console.log('Invalid coordinates. Usage: goto x z');
            }
        } else if (input === 'pos') {
            bots.forEach(bot => {
                if (bot.entity) {
                    const pos = bot.entity.position;
                    console.log(`Bot ${bot.username}'s current position: x: ${Math.round(pos.x)}, y: ${Math.round(pos.y)}, z: ${Math.round(pos.z)}`);
                } else {
                    console.log(`Bot ${bot.username} doesn't have a position yet.`);
                }
            });
        } else if (input === 'afk') {
            afkInterval = setInterval(() => {
                bots.forEach(bot => {
                    bot.setControlState('jump', true);
                });
            }, 1000);
            console.log('AFK mode started for all bots. They will jump continually.');
        } else if (input === 'dafk') {
            clearInterval(afkInterval);
            bots.forEach(bot => {
                bot.setControlState('jump', false);
            });
            console.log('AFK mode stopped.');
        } else if (input === 'recon') {
            bots.forEach(bot => {
                console.log(`Reconnecting bot ${bot.username} to the server...`);
                bot.quit(); // Disconnect
                createBot(bot.username, serverIp, serverPort); // Reconnect
            });
        } else if (input === 'recon@') {
            // Enable auto-reconnect for all bots
            bots.forEach(bot => {
                bot.on('kicked', (reason) => {
                    if (reason.includes('Timed out')) {
                        console.log(`Bot ${bot.username} got disconnected due to timeout. Reconnecting...`);
                        bot.quit(); // Disconnect
                        createBot(bot.username, serverIp, serverPort); // Reconnect
                    }
                });
            });
            console.log('Auto-reconnect enabled for all bots. They will reconnect if disconnected.');
        } else if (input === 'kick') {
            // Handle the "kick" command to log out
            bots.forEach(bot => {
                console.log(`Logging out bot ${bot.username} from the server...`);
                bot.quit();
            });
        } else if (input === 'exit') {
            console.log('Exiting all bots.');
            process.exit(0);
        } else if (input === 'help') {
            console.log(helpMessage);
        } else {
            console.log('Command not recognized. Type "help" to see the available commands.');
        }
        setupConsoleInput();
    });
};

console.log('To run the bots, provide the following information:');
rl.question('bot username: ', (name) => {
    rl.question('server IP: ', (serverIp) => {
        rl.question('server port: ', (serverPort) => {
            rl.question('number of bots to create: ', (numBots) => {
                for (let i = 0; i < numBots; i++) {
                    createBot(`${name}${i}`, serverIp, serverPort);
                }
                setupConsoleInput();
            });
        });
    });
});
