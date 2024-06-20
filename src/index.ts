import * as venom from "venom-bot";
import { BaseChatBot, Chat } from "./llm/base";
import { ComplaintBot } from "./llm/complaintBot";


venom
    .create({
        session: "Agam's another das phone", //name of session
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

async function start(client: venom.Whatsapp) {
    let chat = new Map();
    let bot = new ComplaintBot(client);
    bot.initialize();
    client.onMessage((message) => {
        console.log(message.body);
        if (!chat.has(message.from)) {
            chat.set(message.from, bot.new_chat());
        }
        chat.get(message.from).then((chat: Chat) => {
            chat.get_response(message.body).then((response) => {
                client
                    .sendText(message.from, response)
                    .then((result) => {
                        console.log("Result: ", result); //return object success
                    })
                    .catch((erro) => {
                        console.error("Error when sending: ", erro); //return object error
                    });
            });
        });
    });
}

