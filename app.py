import streamlit as st
from src.Pipeline.Query_Engine import QueryEngine
from ultralytics import YOLO
from PIL import Image
import os

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Load the YOLO model
model = YOLO("src/Components/Skin_issue_Detection/best_model84.pt")

# Set Streamlit config
st.set_page_config("Medi Bot", layout="wide")
st.title("🤖 Medi Bot - Your AI Health Assistant")
st.markdown("Ask about **common diseases, symptoms, or skin conditions** – I'm here to help! 🩺")
st.divider()

# Session state for chat
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

if "detected_issues" not in st.session_state:
    st.session_state.detected_issues = []

# New chat button
if st.button("🆕 Start New Chat"):
    st.session_state.chat_history = []
    st.session_state.detected_issues = []
    st.experimental_rerun()

# Upload image
img = st.sidebar.file_uploader("📤 Upload Skin Image", type=["jpeg", "jpg", "png"])

# If image uploaded
if img:
    img_pil = Image.open(img)
    results = model.predict(img_pil)

    # Show image with bounding boxes
    st.markdown("### 🖼️ Detected Skin Conditions:")
    result_img_bgr = results[0].plot()
    result_img_rgb = Image.fromarray(result_img_bgr[:, :, ::-1])
    st.image(result_img_rgb, caption="YOLO Detection Results", width=600)

    # Extract top 5 results
    boxes = results[0].boxes
    top5 = sorted(zip(boxes.cls.tolist(), boxes.conf.tolist()), key=lambda x: -x[1])[:5]
    class_names = model.names

    st.session_state.detected_issues = list({class_names[int(cls)] for cls, _ in top5})
    st.markdown("#### ✅ Top Detected Issues:")
    st.session_state.chat_history.append(('bot',st.session_state.detected_issues))
    for idx, issue in enumerate(st.session_state.detected_issues, 1):
        st.markdown(f"{idx}. **{issue}**")

lang = st.sidebar.text_input("Enter Your Language",placeholder="Eg:- English,Tamil,Telugu etc....")
# Chat Input
query = st.chat_input("💬 Ask me anything about your health...")

# Process input
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
