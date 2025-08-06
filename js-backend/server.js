const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  dbName: "dailyPlannerDB", 
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: String,
    time: String
});

const Task = mongoose.model('Task', taskSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..' , 'public', 'index.html'));
});

app.get('/tasks/:date', async (req, res) => {
    const tasks = await Task.find({ date: req.params.date });
    res.json(tasks);
});

app.post('/tasks', async (req, res) => {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
});

app.put('/tasks/:id', async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
});

app.delete('/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

app.post('/prompt', async (req, res) => {
    console.log("Received body:", req.body);
    const promptText = req.body.prompt;

    try {
        const result = await model.generateContent(`Extract task operation from prompt: "${promptText}". 
        
        For reference the current date is ("${new Date().toLocaleDateString('en-CA')}").

        Return a JSON object in this format:
        {
          "action": "create" | "get" | "update" | "delete",
          "title": string,
          "description"?: string,
          "date"?: "YYYY-MM-DD",
          "time"?: "HH:MM",
          "newTitle"?: string,
          "newDescription"?: string,
          "newDate"?: "YYYY-MM-DD",
          "newTime"?: "HH:MM"
        }
        - if time not specified return null
        - Use today's date ("${new Date().toLocaleDateString('en-CA')}") if no date is specified.
        - If the prompt is unclear, return {"error": "Invalid prompt"}.
        - Ensure the response is a valid JSON string.`);

        const text = result.response.candidates[0].content.parts[0].text;

        let jsonText = text.trim();

        if (jsonText.startsWith('```json')){
            jsonText = jsonText.slice(7, -3).trim();
         }

        let data;
        try {
            data = JSON.parse(jsonText);
            res.json(data);
        } catch (e) {
            console.error("Invalid Gemini response:", jsonText);
            return res.status(400).json({ error: 'Invalid Gemini response', details:  jsonText });
        }
    } catch (err) {
        console.error('Error in /prompt:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.use(express.static(path.join(__dirname, '..' , 'public')));

app.listen(3000, () => console.log('Server running on port 3000'));