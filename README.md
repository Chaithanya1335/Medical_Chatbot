# 🤖 Medi Bot - AI Medical Assistant

An AI-powered medical chatbot with skin issue detection using YOLOv8 and Groq LLM.

## 🚀 Features

- 🔬 **Skin Issue Detection**: Upload images to detect potential skin conditions using YOLOv8
- 💬 **Medical Q&A**: Ask health questions in multiple languages
- 🌍 **Multilingual Support**: English, Spanish, Hindi, Tamil, Telugu, and more
- ⚡ **Fast Responses**: Powered by Groq's ultra-low latency LLaMA3-8B

## 🛠️ Tech Stack

- **LLM**: Groq (llama-3.1-8b-instant)
- **Embeddings**: HuggingFace MiniLM
- **Vector DB**: FAISS
- **Computer Vision**: YOLOv8 (Ultralytics)
- **RAG Framework**: LangChain
- **UI**: Streamlit

## 📦 Requirements

- Python 3.11+
- GROQ_API_KEY environment variable

## 🚀 Deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Chaithanya1335/Medical_Chatbot)

1. Click the Deploy to Render button above
2. Create a new account or sign in
3. Set the `GROQ_API_KEY` environment variable in the Render dashboard
4. Wait for deployment (~5 minutes)

## 📝 Environment Variables

- `GROQ_API_KEY`: Your Groq API key (get one at https://console.groq.com)

## 🏃‍♂️ Run Locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

---
**Disclaimer**: This is an AI assistant for informational purposes only. Always consult a healthcare professional for medical advice.
