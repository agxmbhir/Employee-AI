import { HumanMessage } from '@langchain/core/messages';
import readline, { createInterface } from 'readline';
import { ComplaintBot } from './llm/complaintBot';
import { getGraph } from './llm/customer';


async function main() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log("Open ai", process.env.OPENAI_API_KEY);
    const bot = await getGraph();

    async function run() {
        rl.question('User:', (input) => {
            let humanMessage = new HumanMessage(input);
            bot.invoke(humanMessage).then((response) => {
                console.log("Bot: ", response);
                run();
            });
        });
    }
    run();
}

main();