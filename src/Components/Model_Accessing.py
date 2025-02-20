from src.exception import CustomException
from src.logging import logging
from langchain_google_genai import GoogleGenerativeAIEmbeddings,ChatGoogleGenerativeAI
from langchain_groq.chat_models import ChatGroq
import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv




load_dotenv()

os.getenv('GEMINI_API_KEY')

class ModelAccessing:

    def __init__(self):
        
        logging.info("Entered Model Accessing Component")
        try:
            # Fetch API key securely
            logging.info("Configuring Gemini")
            self.GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
            self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")

            # Configure the Generative AI client
            genai.configure(api_key=self.GEMINI_API_KEY)

        except Exception as e:
            raise CustomException(e,sys)

    def get_Embedding_model(self):

        logging.info(f"Accessing models/text-embedding-004 using gemini api key {self.GEMINI_API_KEY}")
        try:
            embeding_model = GoogleGenerativeAIEmbeddings(model = "models/embedding-001",google_api_key=self.GEMINI_API_KEY)

            logging.info(" Embedding Model Accessed")
            return embeding_model
        except Exception as e:
            raise CustomException(e,sys)
    
    def get_llm_model(self):
        
        try:
            # Set model and parameters
            logging.info("Accessing llama3-8b-8192 Model using chatgroq  api key")
            temperature = 0.2
            llm_model = ChatGroq(model='llama3-8b-8192',
                                    temperature=0.2,api_key=self.GROQ_API_KEY)
            
            logging.info("LLM Model Accessed")
            return llm_model
        
        except Exception as e:
            raise CustomException(e,sys)
        

            