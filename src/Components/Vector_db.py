from src.logging import logging
from src.exception import CustomException
from src.Components.Model_Accessing import ModelAccessing
from langchain_community.vectorstores import FAISS
import os
import sys

class VectorDB:
    def __init__(self):
        pass

    def create_vector_db(self,text_chunks,embeding_model=ModelAccessing().get_Embedding_model()):
        try:
            logging.info("Creating Vector DB...")
            # Create a new vector database
            vector_db = FAISS.from_texts(text_chunks, embedding=embeding_model)
            logging.info("Vector DB created successfully.")
            return vector_db
        except Exception as e:
            raise CustomException(e,sys)
