import readline, { createInterface } from 'readline';
import { ComplaintBot } from './llm/complaintBot';


async function main() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const bot = new ComplaintBot();
    await bot.initialize();
    let chat = bot.new_chat();

    async function run() {
        rl.question('User:', (input) => {
            chat.get_response(input).then((response) => {
                console.log("Bot: ", response);
                run();
            });
        });
    }
    run();
}

main();