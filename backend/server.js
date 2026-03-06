import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    const systemPrompt = `You are a helpful, knowledgeable AI assistant. Format your responses with clear structure:

1. **Main Answer**: Provide a concise, clear answer
2. **Key Points**: List 3-5 bullet points with important details
3. **Explanation**: Elaborate on the topic with relevant information
4. **Examples** (if applicable): Provide practical examples
5. **Related Topics**: Suggest 2-3 related topics for further exploration

Use markdown formatting with:
- Bold for headers and important terms
- Bullet points for lists
- Clear paragraph breaks for readability
- Numbered lists when showing sequences`;

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1500
    });

    const reply = completion.choices[0].message.content;
    res.json({ 
        reply,
        metadata: {
            model: "gpt-4o-mini",
            tokens_used: completion.usage.total_tokens
        }
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
