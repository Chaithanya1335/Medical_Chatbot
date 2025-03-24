from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from src.logging import logging
from src.exception import CustomException
from src.Components.Model_Accessing import ModelAccessing
from langchain.vectorstores import FAISS
import os
import sys

class QueryEngine:
    def __init__(self):
        
        try:
            logging.info("Creating Prompt Template")
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

            logging.info(" Prompt Template Created ")

        except Exception as e:
            raise CustomException(e,sys)

   

    def get_vector_db(self):

        try:

            logging.info("Configuring Local DataBase ")
            embed_model = ModelAccessing().get_Embedding_model()
            
            vector_db  = FAISS.load_local('faiss_index',embeddings=embed_model,allow_dangerous_deserialization=True)

            logging.info("Local Database configured ")
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

            response = qa.invoke(question)
            
            return (response['query'],response['result']) 

        except Exception as e:
            raise CustomException(e,sys)


if __name__ == "__main__":
    query = QueryEngine().query('what is Acne')
    print("Response : ")
    print(query[1])