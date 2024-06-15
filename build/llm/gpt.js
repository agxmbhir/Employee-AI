"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Complaint = exports.ChatBot = void 0;
var openai_1 = require("@langchain/openai");
var hnswlib_1 = require("@langchain/community/vectorstores/hnswlib");
var messages_1 = require("@langchain/core/messages");
var prompts_1 = require("@langchain/core/prompts");
var history_aware_retriever_1 = require("langchain/chains/history_aware_retriever");
var text_splitter_1 = require("langchain/text_splitter");
var fs = __importStar(require("fs"));
var dotenv_1 = __importDefault(require("dotenv"));
var retrieval_1 = require("langchain/chains/retrieval");
var combine_documents_1 = require("langchain/chains/combine_documents");
var prompts_2 = require("@langchain/core/prompts");
dotenv_1.default.config();
// @ts-ignore
var gpt3 = new openai_1.ChatOpenAI(("gpt-3.5-turbo"));
gpt3.apiKey = process.env.OPENAI_API_KEY;
var prompt = prompts_1.ChatPromptTemplate.fromMessages([
    [
        "system",
        "Answer the user's questions based in a short and brief manner with only relevant information on the following context: {context}.",
    ],
    new prompts_2.MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
]);
var retrieverPrompt = prompts_1.ChatPromptTemplate.fromMessages([
    new prompts_2.MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
    [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
    ],
]);
var ChatBot = /** @class */ (function () {
    function ChatBot() {
        this.history = [];
        this.model = gpt3;
        this.model.apiKey = process.env.OPENAI_API_KEY;
    }
    ChatBot.prototype.get_response = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.retriever.invoke({
                            input: input,
                            chat_history: this.history,
                        })];
                    case 1:
                        response = _a.sent();
                        this.history.push(new messages_1.HumanMessage(input));
                        console.log(response);
                        this.history.push(new messages_1.AIMessage(response.answer));
                        return [2 /*return*/, response.answer];
                }
            });
        });
    };
    ChatBot.prototype.add_retriever = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vectorStore, vector_store_retriever, model, combineDocsChain, history_aware_retriever, retrievalChain;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, get_vector_store()];
                    case 1:
                        vectorStore = _a.sent();
                        return [4 /*yield*/, vectorStore];
                    case 2:
                        vector_store_retriever = (_a.sent()).asRetriever();
                        model = this.model;
                        return [4 /*yield*/, (0, combine_documents_1.createStuffDocumentsChain)({
                                llm: model,
                                prompt: prompt,
                            })];
                    case 3:
                        combineDocsChain = _a.sent();
                        return [4 /*yield*/, (0, history_aware_retriever_1.createHistoryAwareRetriever)({
                                llm: model,
                                retriever: vector_store_retriever,
                                rephrasePrompt: retrieverPrompt,
                            })];
                    case 4:
                        history_aware_retriever = _a.sent();
                        return [4 /*yield*/, (0, retrieval_1.createRetrievalChain)({
                                combineDocsChain: combineDocsChain,
                                retriever: history_aware_retriever,
                            })];
                    case 5:
                        retrievalChain = _a.sent();
                        this.retriever = retrievalChain;
                        return [2 /*return*/, retrievalChain];
                }
            });
        });
    };
    return ChatBot;
}());
exports.ChatBot = ChatBot;
var Complaint = /** @class */ (function (_super) {
    __extends(Complaint, _super);
    function Complaint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Complaint;
}(ChatBot));
exports.Complaint = Complaint;
function get_vector_store() {
    return __awaiter(this, void 0, void 0, function () {
        var text, textSplitter, docs, vectorStore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = fs.readFileSync("test.txt", "utf8");
                    textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({ chunkSize: 1000 });
                    return [4 /*yield*/, textSplitter.createDocuments([text])];
                case 1:
                    docs = _a.sent();
                    vectorStore = hnswlib_1.HNSWLib.fromDocuments(docs, new openai_1.OpenAIEmbeddings());
                    return [2 /*return*/, vectorStore];
            }
        });
    });
}
