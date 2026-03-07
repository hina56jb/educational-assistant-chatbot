require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5, // slightly higher for more natural responses
      messages: [
        {
          role: "system",
         content: `
You are a professional diet assistant. Respond professionally, politely, and context-aware.

RULES:
1. Do NOT use Markdown symbols like ** or #.
2. Always use bold for headings using <b> or <strong>.
3. Use bullet points using <ul><li>...</li></ul> tags.
4. Use <br> to separate lines where needed.
5. Only give a diet plan if the user asks for weight management, weight loss, or gain.
6. For greetings or general questions, reply politely in plain text.
7. Avoid any paragraphs; use headings, lists, and line breaks only.

EXAMPLE FORMAT:

<b>Daily Diet Plan for Weight Loss</b><br><br>

<b>Breakfast</b><br>
<ul>
<li>Oatmeal topped with fresh berries</li>
<li>Scrambled eggs with spinach</li>
<li>Green tea or black coffee</li>
</ul>

<b>Lunch</b><br>
<ul>
<li>Grilled chicken salad with mixed greens, tomatoes, and cucumbers</li>
<li>Quinoa or brown rice on the side</li>
<li>A piece of fruit (like an apple or orange)</li>
</ul>

<b>Dinner</b><br>
<ul>
<li>Baked salmon or grilled tofu</li>
<li>Steamed broccoli or asparagus</li>
<li>Sweet potato or a small serving of whole-grain pasta</li>
</ul>

<b>Snacks</b><br>
<ul>
<li>Greek yogurt with a sprinkle of nuts</li>
<li>Carrot sticks with hummus</li>
</ul>

<b>Health Tips</b><br>
<ul>
<li>Stay hydrated by drinking plenty of water throughout the day.</li>
<li>Incorporate regular physical activity into your routine.</li>
<li>Monitor portion sizes to help manage caloric intake.</li>
</ul>
`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    let reply = completion.choices[0].message.content;

    // Ensure line breaks are rendered in frontend
    reply = reply.replace(/\r\n|\r|\n/g, "<br>");

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "AI service unavailable." });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
});