# 🧠 Prompt Planner

Prompt Planner is an intelligent daily task scheduler that understands natural language prompts and performs **smart CRUD operations** on your to-do list.

It combines the power of **Gemini AI**, **sentence-transformers**, and **MongoDB** to deliver a seamless, prompt-based planning experience.

---


## 🚀 Features


- ✨ **Natural Language Task Creation**  
  Add tasks using simple language like:  
  _"Set up a call with Alex next Monday at 10 AM."_
  

- 🔍 **Intelligent Retrieval**  
  Ask: _"What do I have planned for tomorrow?"_  
  → Returns only relevant tasks.
  

- 🗑️ **Smart Deletion & Update**  
  Say: _"Remove my dentist appointment"_  
  → Finds and deletes the most similar task using sentence-transformers.
  

- 🧠 **Dual AI Engine**  
  - **Gemini API**: For interpreting user prompts and extracting task details.
  - **Sentence Transformers (Flask server)**: For similarity detection between existing and user-mentioned tasks.
  

---


## 🧱 Tech Stack

| Layer        | Technology                      |
|--------------|----------------------------------|
| Frontend     | HTML, JavaScript                 |
| Backend      | Node.js + Express + Gemini API   |
| DB           | MongoDB Atlas                    |
| AI Engine 1  | Gemini Generative AI             |
| AI Engine 2  | Sentence-Transformers via Flask  |
| Deployment   | Localhost                        |

---


## 🗂️ Project Structure

prompt-planner/

├── public/ # Frontend

|├── index.html

|└── script.js

|├── styles.css

├── js-backend/ # Node.js backend

|├── server.js.js


├── python-backend/ # Sentence similarity Flask server

|├── app.py

|├── venv/ # Python virtual environment

|└── requirements.txt


## 🗂️ Project Setup

1. Clone the Repository

git clone https://github.com/SATWIK7770/PromptPlanner.git

cd prompt-planner


2. 🧠 Gemini + Express Server Setup
cd server

npm install

  Add your Gemini API key to .env
  
  MONGO_URI=<your-mongodb-uri>
  
  GEMINI_API_KEY=<your-gemini-api-key>
  
node server.js


4. 🤖 Sentence Similarity Flask Server
   
cd python-backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python app.py


Make sure Flask runs at http://localhost:5000



🧠 AI Models Used

Gemini Pro via Google Generative AI API

all-MiniLM-L6-v2 from sentence-transformers



🧪 Sample Prompts
"Create a meeting with team at 3 PM tomorrow"

"Delete my lunch with Sam"

"What tasks do I have next Tuesday?"



📌 Notes

CORS is enabled in both Flask and Express.

Ensure both servers (Express and Flask) are running when testing.

