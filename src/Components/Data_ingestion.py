from src.exception import CustomException
from src.logging import logging
import os
import sys
import PyPDF2


class DataIngestion:
    """
    This class is responsible for ingesting data from a PDF file and storing it locally.
    """
    def __init__(self, file_path: str) -> None:
        self.file_path = file_path

    def extract_data(self) -> str:
        """
        This function extracts data from the given PDF file and saves it locally.
        """
        try:
            logging.info("Data Ingestion Started")

            text = ""

            logging.info("Data Extraction Started")

            # Extracting text from PDF and storing it in the text variable
            with open(self.file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    extracted_text = page.extract_text()
                    if extracted_text:  # Ensure extracted_text is not None
                        text += extracted_text

            logging.info("Data Extraction Completed")

            # Define local storage paths
            folder_path = "Data"
            file_path = os.path.join(folder_path, "Extracted.txt")

            os.makedirs(folder_path, exist_ok=True)

            # Write extracted text to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(text)

            logging.info(f"Data Saved Locally at {file_path}")

            return file_path
        except Exception as e:
            logging.error(f"Error in Data Ingestion: {str(e)}")
            raise CustomException(e, sys)


if __name__ == "__main__":
    file_path = r"D:\Personal projects\Medical_Chatbot\The-Gale-Encyclopedia-of-Medicine-3rd-Edition-staibabussalamsula.ac_.id_.pdf"
    path = DataIngestion(file_path=file_path).extract_data()
    print(f"Extracted data saved at: {path}")
