from src.logging import logging
from src.exception import CustomException
from src.Components.Model_Accessing import ModelAccessing
from src.Components.Preprocessing import Preprocessing
from langchain_community.vectorstores import FAISS
import os
import sys

class VectorDB:
    """
    Handles the creation and saving of a FAISS vector database
    from a list of text chunks using an embedding model.
    """

    def __init__(self):
        pass  # No init logic for now

    def create_vector_db(self, text_chunks, embedding_model=None):
        """
        Creates a FAISS vector database from the provided text chunks.

        Args:
            text_chunks (List[str]): List of text segments to index.
            embedding_model (Embedding): LangChain-compatible embedding model.
                                         If None, defaults to ModelAccessing().get_Embedding_model()

        Returns:
            FAISS: The created vector database object.
        """
        try:
            logging.info("Creating Vector DB...")

            # Use default embedding model if not passed
            if embedding_model is None:
                embedding_model = ModelAccessing().get_Embedding_model()

            # Create FAISS vector store
            vector_db = FAISS.from_texts(text_chunks, embedding=embedding_model)

            logging.info("Vector DB created successfully.")

            # Save to local directory
            vector_db.save_local("faiss_index")
            logging.info("Vector DB saved locally at 'faiss_index'.")

            return vector_db

        except Exception as e:
            raise CustomException(e, sys)



