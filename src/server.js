require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { OpenAIApi, Configuration } = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API configuration
const configuration = new Configuration({
  apiKey: process.env.OPENROUTER_API_KEY,
});
const openai = new OpenAIApi(configuration);

// API endpoint
app.post('/api/convert', async (req, res) => {
  try {
    const { sourceLang, targetLang, code } = req.body;
    
    if (!sourceLang || !targetLang || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `Convert the following code from ${sourceLang} to ${targetLang}:\n\n${code}`;

    const response = await openai.createChatCompletion({
      model: "deepseek/deepseek-r1:free",
      messages: [{ role: "user", content: prompt }],
    });

    const fullOutput = response.data.choices?.[0]?.message?.content || "// No response received.";
    const codeMatch = fullOutput.match(/```(?:\w+)?\n([\s\S]*?)```/);
    const extractedCode = codeMatch ? codeMatch[1].trim() : fullOutput;

    res.json({ convertedCode: extractedCode });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Error converting code' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});