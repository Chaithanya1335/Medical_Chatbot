**Medi Bot – AI-Powered Skin Health Assistant** :

* 🧠 Overview
* 🔧 Features
* 🚀 Tech Stack
* 🧱 Architecture Diagram
* 🛠️ Setup & Execution Instructions
* 🧪 Example Use
* 📂 Folder Structure
* 👤 Author and Credits

---


```markdown
# 🩺 Medi Bot – AI-Powered Skin Health Assistant 🤖

Medi Bot is an advanced **GenAI-based medical assistant** that integrates **YOLOv8 for skin issue detection**, **Groq LLMs for fast conversational responses**, and **LangChain RAG** for answering queries from a custom medical knowledge base. It also supports **multilingual interaction**, making healthcare information more accessible.

---

## 🚀 Features

- 🔬 **Top-5 Skin Issue Detection**  
  Upload an image, and the model detects the **top 5 likely skin conditions** using a custom-trained YOLOv8 model.

- 💬 **Conversational AI with Groq LLMs**  
  Ask questions about symptoms, general health, or even the detected skin issues. Medi Bot understands and responds instantly.

- 🌍 **Multilingual Support**  
  Users can ask queries in regional languages like Hindi, Telugu, Tamil, etc. Medi Bot translates and responds in the same language.

- 📚 **Document-Based RAG (Retrieval-Augmented Generation)**  
  Answers are generated using a local knowledge base created from medical PDFs and structured data (CSV), stored in a FAISS vector database.

- ⚡ **Superfast LLM Responses with Groq**  
  Utilizes Groq’s ultra-low latency inference on `LLaMA3-8B` for real-time, reliable answers.

---

## 🛠️ Tech Stack

| Component           | Technology                      |
|---------------------|----------------------------------|
| LLM                 | Groq (`llama3-8b-8192`)          |
| Embeddings          | HuggingFace MiniLM               |
| Vector DB           | FAISS                            |
| CV Model            | YOLOv8 (Ultralytics)             |
| RAG Framework       | LangChain                        |
| Translation         | Googletrans / LanguageDetect     |
| UI                  | Streamlit                        |
| Storage             | Local text, PDF, CSV             |

---

## 🧱 Architecture Diagram

```

```
               ┌────────────────────────────┐
               │      Streamlit UI          │
               └─────────────┬──────────────┘
                             │
       ┌─────────────────────▼────────────────────┐
       │         YOLOv8 Skin Detector             │
       └─────────────────────┬────────────────────┘
                             │
                 ┌───────────▼────────────┐
                 │ Detected Issue Handler │
                 └───────────┬────────────┘
                             │
     ┌───────────────────────▼────────────────────────┐
     │         Multilingual Query Translator           │
     └───────────────────────┬────────────────────────┘
                             │
     ┌───────────────────────▼────────────────────────┐
     │           LangChain RAG System                  │
     │ (FAISS + MiniLM + PDF/CSV Chunking)             │
     └───────────────────────┬────────────────────────┘
                             │
     ┌───────────────────────▼────────────────────────┐
     │             Groq LLM (LLaMA3-8B)                │
     └───────────────────────┬────────────────────────┘
                             │
               ┌─────────────▼─────────────┐
               │    Final Answer (UI)      │
               └───────────────────────────┘
```

````

---

## ⚙️ How to Run Locally

### 1. 📦 Clone the Repository
```bash
git clone https://github.com/your-username/medi-bot.git
cd medi-bot
````

### 2. 🧪 Create and Activate Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. 🔽 Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. 🔑 Setup Environment Variables

Create a `.env` file in the root directory:

```ini
GROQ_API_KEY=your_groq_api_key
HF_TOKEN=your_huggingface_token
```

### 5. 📂 Place Your Data

* PDF: `Data/The-Gale-Encyclopedia-of-Medicine.pdf`
* CSV: `Data/train_data_chatbot.csv`

### 6. 🏗️ Build the Vector Store

```bash
python src/Components/DataIngestion.py
```

### 7. 🚀 Launch the App

```bash
streamlit run app.py
```

---

## 🧪 Example Use

1. Upload a skin image using the sidebar.
2. The model detects top 5 skin conditions.
3. Ask:

   * “What is \[detected issue]?”
   * “What are the symptoms of \[detected issue]?”
   * “How to treat \[detected issue] at home?”
4. Medi Bot fetches and responds instantly – even in your native language!

---

## 📂 Folder Structure

```
medi-bot/
│
├── app.py
├── requirements.txt
├── .env
├── Data/
│   ├── The-Gale-Encyclopedia-of-Medicine.pdf
│   └── train_data_chatbot.csv
├── src/
│   ├── Components/
│   │   ├── DataIngestion.py
│   │   ├── Preprocessing.py
│   │   ├── Vector_db.py
│   │   ├── Model_Accessing.py
│   │   └── Skin_issue_Detection/
│   │        └── best_model84.pt
│   ├── Pipeline/
│   │   └── Query_Engine.py
│   ├── logging.py
│   └── exception.py
```

---

## 👨‍💻 Author

**Gnana Chaithanya**
Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/gnana-chaithanya)

---

## 🏷️ Tags

`#GenAI` `#SkinHealth` `#YOLOv8` `#Groq` `#LangChain` `#LLM` `#MultilingualAI` `#ComputerVision` `#Streamlit` `#HealthcareAI`


