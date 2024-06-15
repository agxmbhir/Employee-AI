import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { type Runnable, type RunnableInterface, RunnableConfig } from "@langchain/core/runnables";
import { pull } from "langchain/hub";
import * as fs from "fs";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import type { BaseMessage } from "@langchain/core/messages";

dotenv.config();
// @ts-ignore
const gpt3 = new ChatOpenAI(("gpt-3.5-turbo"));
gpt3.apiKey = process.env.OPENAI_API_KEY;

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Answer the user's questions based in a short and brief manner with only relevant information on the following context: {context}.",
    ],
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
]);

const retrieverPrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
    [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
    ],
]);

type Retriever = Runnable<{
    input: string;
    chat_history?: string | BaseMessage[];
} & {
    [key: string]: unknown;
}, {
    context: Document<Record<string, any>>[];
    answer: string;
} & {
    [key: string]: unknown;
}, RunnableConfig>;


export class ChatBot {
    model: ChatOpenAI;
    retriever: Retriever;
    chats: Chat[] = [];


    public constructor() {
        this.model = gpt3;
        this.model.apiKey = process.env.OPENAI_API_KEY;
    }

    // public async get_response(input: string) {
    //     const response = await this.retriever.invoke({
    //         input: input,
    //         chat_history: this.history,
    //     });
    //     this.history.push(new HumanMessage(input));
    //     console.log(response);
    //     this.history.push(new AIMessage(response.answer as string));
    //     return response.answer;
    // }

    public async new_chat() {
        const chat = new Chat(this);
        this.chats.push(chat);
        return chat;
    }


    public async add_retriever() {
        const vectorStore = await get_vector_store();
        const vector_store_retriever = (await vectorStore).asRetriever();
        let model = this.model;
        const combineDocsChain = await createStuffDocumentsChain({
            llm: model,
            prompt,
        });
        const history_aware_retriever = await createHistoryAwareRetriever({
            llm: model,
            retriever: vector_store_retriever,
            rephrasePrompt: retrieverPrompt,
        });

        const retrievalChain = await createRetrievalChain({
            combineDocsChain,
            retriever: history_aware_retriever,
        });
        this.retriever = retrievalChain;
        return retrievalChain;
    }
}

export class Chat {
    history: BaseMessage[] = [];
    ChatBot: ChatBot;

    constructor(bot: ChatBot) {
        this.ChatBot = bot;
    }

    public async get_response(input: string) {
        const response = await this.ChatBot.retriever.invoke({
            input: input,
            chat_history: this.history,
        });
        this.history.push(new HumanMessage(input));
        console.log(response);
        this.history.push(new AIMessage(response.answer as string));
        return response.answer;
    }

}

export class Complaint extends ChatBot {

}

async function get_vector_store() {
    const text = fs.readFileSync("test.txt", "utf8");
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text]);

    const vectorStore = HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    return vectorStore;
}
