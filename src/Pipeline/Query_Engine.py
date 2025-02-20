from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from src.logging import logging
from src.exception import CustomException
from src.Components.Data_ingestion import DataIngestion
from src.Components.Preprocessing import Preprocessing
from src.Components.Model_Accessing import ModelAccessing
from src.Components.Vector_db import VectorDB
import os
import sys

class QueryEngine:
    def __init__(self):
        
        try:
            Prompt = ''' 
                        You are a medical assistant AI designed to assist with medical queries. 
                        Based on the given context, answer the user's question accurately and comprehensively.
                        give output in the bullet format

                        Context:
                        {context}

                        User's Question:
                        {question}

                        Output:
                        1. **Answer**: Provide the most accurate and detailed answer to the user's question.
                        2. **Recommended Medication**: List relevant medications or treatments (if applicable) based on the provided context.
                        3. **Recommended Products**: Suggest relevant products (e.g., skincare, cosmetics, or therapeutic items) for management or treatment (if applicable).

                        '''
            
            self.prompt_templete = PromptTemplate(template=Prompt,input_variables=['context','question'])

            self.chain_type_kwargs = {"prompt":self.prompt_templete}

            self.model = ModelAccessing().get_llm_model()

        except Exception as e:
            raise CustomException(e,sys)

    def get_chunked_data(self,path):

        try:
            data_path = DataIngestion(path).extract_data()

            data = Preprocessing(path=data_path).read_data()

            chunked_data = Preprocessing(path).get_text_chunks(data)

            return chunked_data
        
        except Exception as e:
            raise CustomException(e,sys)

    def get_vector_db(self):

        try:

            embed_model = ModelAccessing().get_Embedding_model()
            
            chunked_data = self.get_chunked_data(path="D:\Personal projects\Medical_Chatbot\The-Gale-Encyclopedia-of-Medicine-3rd-Edition-staibabussalamsula.ac_.id_.pdf")

            vector_db  = VectorDB().create_vector_db(chunked_data,embed_model)

            return vector_db
        
        except Exception as e:
            raise CustomException(e,sys)




    def query(self,question):
        try:
            qa = RetrievalQA.from_chain_type(
                llm = self.model,
                chain_type = 'stuff',
                retriever = self.get_vector_db().as_retriever(),
                return_source_documents = True,
                chain_type_kwargs = self.chain_type_kwargs
            )

            response = qa(question)
            
            return (response['query'],response['result']) 

        except Exception as e:
            raise CustomException(e,sys)


if __name__ == "__main__":
    query = QueryEngine().query('what is Acne')
    print("Response : ")
    print(query)