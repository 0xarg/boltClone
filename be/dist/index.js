import { OpenRouter } from "@openrouter/sdk";
import * as dotenv from "dotenv";
dotenv.config();
const openRouter = new OpenRouter({
    apiKey: process.env.CLAUDE_API_KEY,
});
const result = await openRouter.callModel({
    model: "anthropic/claude-sonnet-4.5",
    input: "Create a todo application",
});
for await (const item of result.getTextStream()) {
    console.log(item);
}
//# sourceMappingURL=index.js.map