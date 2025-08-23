import streamlit as st
from src.Pipeline.Query_Engine import QueryEngine
from ultralytics import YOLO
from PIL import Image
import os

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Load the YOLO model
try:
    model = YOLO("src/Components/Skin_issue_Detection/best_model84.pt")
except Exception as e:
    st.error(f"Error loading YOLO model: {e}")
    st.stop()

# Set Streamlit page config and inject custom CSS
st.set_page_config(
    page_title="Medi Bot", 
    layout="wide",
)

st.markdown(
    """
    <style>
    /* Main container and chat area background */
    .st-emotion-cache-1c7v05j {
        background-color: #f0f2f6; /* A light grey for the chat window */
    }

    /* User message styling */
    .st-emotion-cache-1c7v05j .stChatMessage.st-emotion-cache-h5gq8t:first-of-type {
        background-color: #d1e7ff; /* A light blue for user messages */
        border-radius: 15px;
        padding: 10px 15px;
        margin-bottom: 10px;
    }

    /* Assistant message styling */
    .st-emotion-cache-1c7v05j .stChatMessage.st-emotion-cache-1t12j1e:first-of-type {
        background-color: #ffffff; /* White background for assistant messages */
        border-radius: 15px;
        padding: 10px 15px;
        margin-bottom: 10px;
    }
    
    /* Ensuring user messages are aligned right */
    .stChatMessage.st-emotion-cache-h5gq8t {
        text-align: right;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# App Title and Description
st.title("🤖 Medi Bot - Your AI Health Assistant")
st.markdown("Ask about **common diseases, symptoms, or skin conditions** – I'm here to help! 🩺")
st.divider()

# Session state for chat
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

if "detected_issues" not in st.session_state:
    st.session_state.detected_issues = []

# Sidebar for controls
with st.sidebar:
    st.header("Upload Skin Image 📤")
    img = st.file_uploader("Upload an image", type=["jpeg", "jpg", "png"])
    lang = st.text_input("Enter Your Language", placeholder="Eg: English, Tamil, Telugu, etc.")
    
    st.markdown("---")
    if st.button("🆕 Start New Chat"):
        st.session_state.chat_history = []
        st.session_state.detected_issues = []
        st.experimental_rerun()

# Main content area
if img:
    try:
        img_pil = Image.open(img)
        
        # Create two columns for image display
        col1, col2 = st.columns([1, 1])
        
        with col1:
            st.markdown("### 🖼️ Original Image:")
            st.image(img_pil, use_column_width=True)
            
        with col2:
            with st.spinner("Analyzing image..."):
                results = model.predict(img_pil)
                st.markdown("### 🕵️‍♂️ Detection Results:")
                result_img_bgr = results[0].plot()
                result_img_rgb = Image.fromarray(result_img_bgr[:, :, ::-1])
                st.image(result_img_rgb, caption="YOLO Detection Results", use_column_width=True)

        # Extract top 5 results
        boxes = results[0].boxes
        top5 = sorted(zip(boxes.cls.tolist(), boxes.conf.tolist()), key=lambda x: -x[1])[:5]
        class_names = model.names

        st.session_state.detected_issues = list({class_names[int(cls)] for cls, _ in top5})
        
        st.markdown("#### ✅ Top Detected Issues:")
        if st.session_state.detected_issues:
            # Check if bot message about issues already exists to prevent duplication
            if not any("Top Detected Issues" in str(msg) for _, msg in st.session_state.chat_history):
                issue_list = "\n".join([f"{idx}. **{issue}**" for idx, issue in enumerate(st.session_state.detected_issues, 1)])
                st.session_state.chat_history.append(('bot', f"Based on your image, I've detected the following potential issues:\n\n{issue_list}"))
        else:
            st.session_state.chat_history.append(('bot', "I couldn't detect any specific skin issues in the image. Please try a different one or ask a question."))
    
    except Exception as e:
        st.error(f"An error occurred while processing the image: {e}")

# Chat Input and Logic
query = st.chat_input("💬 Ask me anything about your health...")

if query:
    st.session_state.chat_history.append(("user", query))
    with st.spinner("Thinking... 🤔"):
        matched_issue = None
        for issue in st.session_state.detected_issues:
            if issue.lower() in query.lower():
                matched_issue = issue
                break

        if matched_issue:
            response = QueryEngine(lang=lang).query(f"What is {matched_issue}")
        else:
            response = QueryEngine(lang=lang).query(query)

        st.session_state.chat_history.append(("bot", response['answer']))

# Chat history display
for role, message in st.session_state.chat_history:
    with st.chat_message("user" if role == "user" else "assistant"):
        st.markdown(message)

# Default prompt
if not st.session_state.chat_history and not query:
    st.info("👋 Please enter a health-related query or upload a skin image.")