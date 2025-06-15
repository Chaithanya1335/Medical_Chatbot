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
    """
    A utility class for reading, cleaning, and chunking textual data for LLM pipelines.
    """

    def __init__(self, path: Path):
        self.path = path

        # Ensure required NLTK resources are downloaded
        try:
            nltk.data.find('tokenizers/punkt')
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('punkt')
            nltk.download('stopwords')

    def read_data(self) -> str:
        """
        Reads text data from the given file path.

        Returns:
            str: Raw text from the file.
        """
        try:
            if not os.path.exists(self.path):
                raise CustomException("The specified path does not exist.")
            with open(self.path, encoding='utf-8') as f:
                data = f.read()
            logging.info(f"Data successfully read from {self.path}")
            return data
        except Exception as e:
            raise CustomException(e, sys)

    def preprocess_text(self, text: str) -> str:
        """
        Preprocesses text by removing special characters, converting to lowercase, and removing stopwords.

        Args:
            text (str): Raw input text.

        Returns:
            str: Cleaned and processed text.
        """
        try:
            logging.info("Starting text preprocessing...")

            text = text.lower()  # Lowercase
            text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
            text = text.replace('\n', ' ')  # Remove newlines

            logging.info("Removed special characters and converted to lowercase.")

            stop_words = set(stopwords.words('english'))
            sentences = sent_tokenize(text)

            processed_text = []
            for sentence in sentences:
                words = word_tokenize(sentence)
                words = [word for word in words if word not in stop_words]
                processed_text.append(' '.join(words))

            cleaned_text = ' '.join(processed_text)
            logging.info("Text preprocessing completed.")
            return cleaned_text

        except Exception as e:
            raise CustomException(e, sys)

    def get_text_chunks(self, text: str) -> list:
        """
        Splits the preprocessed text into overlapping chunks for embedding and vector DB.

        Args:
            text (str): The preprocessed text.

        Returns:
            list: A list of chunked text segments.
        """
        try:
            logging.info("Splitting text into chunks...")
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=1000)
            chunks = text_splitter.split_text(text)
            logging.info(f"Text chunking completed. Total chunks: {len(chunks)}")
            return chunks
        except Exception as e:
            raise CustomException(e, sys)
