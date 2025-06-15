from src.exception import CustomException
from src.logging import logging
from src.Components.Preprocessing import Preprocessing
from src.Components.Model_Accessing import ModelAccessing
from src.Components.Vector_db import VectorDB
from langchain_community.document_loaders import CSVLoader
import PyPDF2
import os
import sys

class DataIngestion:
    """
    Handles extraction of textual data from PDF and CSV files,
    merges them, and stores the final output locally.
    """

    def __init__(self, file_path: str, csv_path: str) -> None:
        self.file_path = file_path
        self.csv_path = csv_path

    def extract_data(self) -> str:
        """
        Extracts and combines text from PDF and CSV, then saves locally.

        Returns:
            str: Path to the saved text file.
        """
        try:
            logging.info("Data Ingestion Started")

            # Verify files exist
            if not os.path.exists(self.file_path):
                raise FileNotFoundError(f"PDF file not found: {self.file_path}")
            if not os.path.exists(self.csv_path):
                raise FileNotFoundError(f"CSV file not found: {self.csv_path}")

            # Extract text from PDF
            logging.info("Extracting text from PDF...")
            text = ""
            with open(self.file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"

            # Extract text from CSV
            logging.info("Extracting text from CSV...")
            csv_loader = CSVLoader(file_path=self.csv_path)
            csv_docs = csv_loader.load()
            csv_text = "\n".join(doc.page_content for doc in csv_docs)

            # Combine both
            final_text = text + "\n" + csv_text
            logging.info("Text extraction and merging completed.")

            # Save to local file
            folder_path = "Data"
            os.makedirs(folder_path, exist_ok=True)
            output_path = os.path.join(folder_path, "Extracted.txt")

            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(final_text.strip())

            logging.info(f"Combined data saved to: {output_path}")
            return output_path

        except Exception as e:
            logging.error("Exception during data ingestion.")
            raise CustomException(e, sys)
