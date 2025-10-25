from src.exception import CustomException
from src.logging import logging
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq.chat_models import ChatGroq
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ModelAccessing:
    """
    Provides access to embedding and LLM models using configured API keys.
    """

    def __init__(self):
        """
        Initialize by securely loading the GROQ API key from environment variables.
        """
        try:
            logging.info("Initializing ModelAccessing...")
            self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")

            if not self.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY not found in environment variables.")

            logging.info("ModelAccessing initialized successfully.")

        except Exception as e:
            raise CustomException(e, sys)

    def get_Embedding_model(self):
        """
        Returns a HuggingFace Embeddings model instance.

        Returns:
            HuggingFaceEmbeddings: Embedding model instance.
        """
        try:
            logging.info("Loading HuggingFace embedding model: all-MiniLM-L6-v2")
            embedding_model = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
            logging.info("Embedding model loaded successfully.")
            return embedding_model

        except Exception as e:
            raise CustomException(e, sys)

    def get_llm_model(self):
        """
        Returns a Groq-hosted LLaMA3 LLM model instance via ChatGroq.

        Returns:
            ChatGroq: LLM instance.
        """
        try:
            logging.info("Loading Groq LLM model: llama3-8b-8192")
            llm_model = ChatGroq(
                model='llama-3.1-8b-instant',
                temperature=0.2,
                api_key=self.GROQ_API_KEY
            )
            logging.info("LLM model loaded successfully.")
            return llm_model

        except Exception as e:
            raise CustomException(e, sys)
