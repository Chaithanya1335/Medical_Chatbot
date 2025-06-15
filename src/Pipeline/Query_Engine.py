from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts import PromptTemplate
from src.logging import logging
from src.exception import CustomException
from src.Components.Model_Accessing import ModelAccessing
from langchain_community.vectorstores import FAISS
import os
import sys

class QueryEngine:
    """
    QueryEngine is responsible for handling user medical queries using a retrieval-based
    question-answering approach with vector database support.

    It loads a language model, embedding model, and prebuilt FAISS vector index to
    return concise answers based on contextual medical documents.
    """

    def __init__(self,lang):
        """
        Initializes the QueryEngine class by:
        - Creating a prompt template for medical question answering.
        - Loading the language model via ModelAccessing.
        """
        try:
            logging.info("Creating Prompt Template")
            self.lang = lang
            Prompt = ''' 
                You are a medical assistant tasked with helping users with general medical queries.  
                Based on the given context, answer the user's question clearly and concisely.  
                Avoid long explanations; provide a summarized response.answer the question in {lang}

                Context:  
                {context}

                User's Question:  
                {input}
            '''

            self.prompt_templete = PromptTemplate(template=Prompt, input_variables=['context', 'input','lang'])

            self.chain_type_kwargs = {"prompt": self.prompt_templete}
            self.model = ModelAccessing().get_llm_model()

            logging.info("Prompt Template Created")

        except Exception as e:
            raise CustomException(e, sys)

    def get_vector_db(self):
        """
        Loads a prebuilt FAISS vector store from the local filesystem using the
        embedding model from ModelAccessing.

        Returns:
            FAISS: Vector store containing indexed medical documents.
        """
        try:
            logging.info("Configuring Local DataBase ")
            embed_model = ModelAccessing().get_Embedding_model()

            vector_db = FAISS.load_local(
                'faiss_index',
                embeddings=embed_model,
                allow_dangerous_deserialization=True
            )

            logging.info("Local Database configured")
            return vector_db

        except Exception as e:
            raise CustomException(e, sys)

    def query(self, question):
        """
        Answers a user question by retrieving relevant documents from the vector store
        and generating a concise response using the LLM and prompt.

        Args:
            question (str): User's health-related query.

        Returns:
            dict: A dictionary containing the final generated response.
        """
        try:
            stuff_chain = create_stuff_documents_chain(llm=self.model, prompt=self.prompt_templete)

            qa = create_retrieval_chain(
                retriever=self.get_vector_db().as_retriever(),
                combine_docs_chain=stuff_chain
            )

            response = qa.invoke({'input': question,'lang':self.lang})
            return response

        except Exception as e:
            raise CustomException(e, sys)
