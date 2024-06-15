import * as venom from "venom-bot";
import { ChatBot } from "./llm/gpt";


venom
    .create({
        session: "Agam's Phone432", //name of session
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

async function start(client) {
    let bot = new ChatBot();
    await bot.add_retriever();

    client.onMessage((message) => {
        console.log(message.body);
        bot.get_response(message.body).then((response) => {
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
}

