from src.logging import logging
from src.exception import CustomException
import os
import sys
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from langchain.text_splitter import RecursiveCharacterTextSplitter
import re
from pathlib import Path


class Preprocessing:
    def __init__(self, path:Path):
        self.path = path
    
    def read_data(self):
        try:
            path = self.path
            if not os.path.exists(path):
                raise CustomException("The path does not exist")
            with open(path,encoding='utf-8') as f:
                data = f.read()
            return data
        
        except Exception as e:
            raise CustomException(e,sys)
        
    def preprocess_text(self,text:str):
        """
        Preprocess the text by removing special characters, converting to lowercase, and removing stopwords.

        Args: text (str): The text to be preprocessed.

        Returns: str: The preprocessed text.
        """
        try:
            logging.info("Data Preprocessing Entered")
            text = text.lower()  # Convert to lowercase
            text = re.sub('[^\w\s]','',text)
            text= text.replace('\n','')
            logging.info("Unnecessary Characters Removed")

            logging.info("Stopword Removal Process Started")
            # Tokenize the text into sentences
            sentences = sent_tokenize(text)

            # Tokenize each sentence into words and remove stopwords
            stop_words = set(stopwords.words('english'))
            processed_sentences = ''
            for sentence in sentences:
                words = word_tokenize(sentence)
                words = [word for word in words if word not in stop_words]
                processed_sentences=' '.join(words)+" "

            logging.info("Data Preprocessing Completed")
            return processed_sentences
        except Exception as e:
            raise CustomException(e,sys)
    
    def get_text_chunks(self,text:str):

        """
        Split the text into chunks of 1000 characters each.

        Args: text (str): The text to be split.

        Returns: list: A list of text chunks.

        """
        try:
            logging.info("Text Chunking Started")
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
            chunks = text_splitter.split_text(text)
            logging.info("Text Chunking Completed")
            return chunks
        except Exception as e:
            raise CustomException(e,sys)