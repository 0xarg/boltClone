import { OpenRouter } from "@openrouter/sdk";
import * as dotenv from "dotenv";
import express from "express";
import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
import cors from "cors";
dotenv.config();

const openRouter = new OpenRouter({
  apiKey: process.env.CLAUDE_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;
  console.log(prompt);

  const response = await openRouter.chat.send({
    messages: [
      {
        role: "user",
        content: prompt,
      },
      {
        role: "system",
        content:
          "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
      },
    ],
    model: "anthropic/claude-sonnet-4.5",
  });

  const answer = response.choices[0]?.message.content; // react or node
  console.log(answer);
  if (answer == "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  if (answer === "node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  res.status(403).json({ message: "You cant access this" });
  return;
});

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  console.log(messages);
  const messagesWithSystem = [
    { role: "system", content: getSystemPrompt() },
    ...messages,
  ];
  const response = await openRouter.chat.send({
    messages: messagesWithSystem,
    model: "anthropic/claude-sonnet-4.5",
  });

  console.log(response);

  res.json({
    response: response.choices[0]?.message.content,
  });
});

app.listen(3000);
