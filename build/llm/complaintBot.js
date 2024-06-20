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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintBot = exports.complaintBotPrompt = void 0;
var prompts_1 = require("@langchain/core/prompts");
var tools_1 = require("@langchain/core/tools");
var retriever_1 = require("langchain/tools/retriever");
var base_1 = require("./base");
var agents_1 = require("langchain/agents");
var zod_1 = require("zod");
var prompts_2 = require("@langchain/core/prompts");
exports.complaintBotPrompt = prompts_1.ChatPromptTemplate.fromMessages([
    [
        "system",
        "Answer the user's questions based in a short and brief manner with only relevant information on the following context: {context}.\n        and also register the user's complaints and sending them to the responsible person while notifying the admin. \n        To register a complaint, you need to understand the complaint, then fetch the responsible person and their contact, \n        and the admin's contact and send the complaint to the responsible person while notifying the admin.\n          ",
    ],
    new prompts_2.MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
]);
var ComplaintBot = /** @class */ (function (_super) {
    __extends(ComplaintBot, _super);
    function ComplaintBot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComplaintBot.prototype.intiialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var retrieverTool, complaintTool, tools, agent, agentExecutor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.runnable) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        retrieverTool = (0, retriever_1.createRetrieverTool)(this.vectorStoreRetriever, {
                            name: "StakeHolder and responsibility Database",
                            description: "A tool used to retrieve the responsible person for a complaint. It contains the phone number of the stakeholder, the area of responsibility and the phone number of the admin."
                        });
                        complaintTool = this.get_complaint_manager_tool();
                        tools = [complaintTool, retrieverTool];
                        return [4 /*yield*/, (0, agents_1.createOpenAIFunctionsAgent)({
                                llm: this.model,
                                tools: tools,
                                prompt: exports.complaintBotPrompt
                            })];
                    case 3:
                        agent = _a.sent();
                        agentExecutor = new agents_1.AgentExecutor({
                            agent: agent,
                            tools: tools,
                            verbose: true,
                        });
                        this.runnable = agentExecutor;
                        return [2 /*return*/];
                }
            });
        });
    };
    ComplaintBot.prototype.new_chat = function () {
        var chat = new base_1.Chat(this);
        this.chats.push(chat);
        return chat;
    };
    ComplaintBot.prototype.get_complaint_manager_tool = function () {
        var _this = this;
        var complaint_manager_tool = new tools_1.DynamicStructuredTool({
            name: "Customer Complaint Manager",
            description: "A tool used to register customer complaints and send them to the responsible person while notifying the admin.",
            schema: zod_1.z.object({
                complaint: zod_1.z.string(),
                admin: zod_1.z.string(),
                stakeHolderPhone: zod_1.z.string(),
                compaineePhone: zod_1.z.string(),
            }),
            func: function (input) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, submit_complaint(this.whatsappClient, input.complaint, input.admin, input.stakeHolderPhone, input.compaineePhone)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            }); }); },
        });
        return complaint_manager_tool;
    };
    return ComplaintBot;
}(base_1.BaseChatBot));
exports.ComplaintBot = ComplaintBot;
/*
   A function to submit a complaint to the responsible person and notify the admin.
*/
function submit_complaint(client, complaint, admin, stakeHolderPhone, compaineePhone) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.sendText(stakeHolderPhone, "A new complaint has been registered: ".concat(complaint, " \n    and the compainee's phone number is ").concat(compaineePhone)).then(function (result) {
                        console.log("Result: ", result); //return object success
                    }).catch(function (error) { return error; })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, client.sendText(admin, "A new complaint has been registered: ".concat(complaint, "\n     and the stakeholder's phone number is ").concat(stakeHolderPhone, "\n      and the compainee's phone number is ").concat(compaineePhone)).then(function (result) {
                            console.log("Result: ", result); //return object success
                        }).then(function (error) { return error; })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, "Complaint registered successfully!"];
            }
        });
    });
}
