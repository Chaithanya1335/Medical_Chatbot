import streamlit as st
from src.Pipeline.Query_Engine import QueryEngine

# Set page configuration
st.set_page_config("Medi Bot", layout='wide')

# Title and description
st.title("🤖 Medi Bot - Your AI Health Assistant")
st.markdown("Ask about **common diseases, symptoms, or skin conditions** – I'm here to help! 🩺")
st.divider()

# Initialize session state for chat history
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# New Chat button
if st.button("🆕 Start New Chat"):
    st.session_state.chat_history = []
    st.experimental_rerun()

# Chat input
query = st.chat_input("💬 Ask me anything about your health...")

# If user submits a query
if query:
    # Show user's message
    st.session_state.chat_history.append(("user", query))

    # Show bot's response
    with st.spinner("Thinking... 🤔"):
        query_engine = QueryEngine()
        response = query_engine.query(query)
        st.session_state.chat_history.append(("bot", response[1]))

# Display previous chat messages
for role, message in st.session_state.chat_history:
    with st.chat_message("user" if role == "user" else "assistant"):
        st.markdown(message)

# Prompt user to enter a query if nothing is entered yet
if not st.session_state.chat_history and not query:
    st.info("👋 Please enter a health-related query in the chat box above.")
