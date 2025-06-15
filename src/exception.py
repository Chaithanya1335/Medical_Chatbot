import sys

def error_message_detail(error, error_detail: sys):
    """
    Returns a detailed error message including the script name,
    line number, and the actual exception message.

    Args:
        error (Exception): The raised exception.
        error_detail (sys): The sys module to extract exception info.

    Returns:
        str: Formatted error message with filename and line number.
    """
    _, _, exc_tb = error_detail.exc_info()  # traceback object
    file_name = exc_tb.tb_frame.f_code.co_filename  # name of the script where error occurred
    error_message = 'Error Occurred in Python Script: [{0}], Line Number: [{1}], Message: [{2}]'.format(
        file_name,
        exc_tb.tb_lineno,
        str(error)
    )
    return error_message

class CustomException(Exception):
    """
    A custom exception class that captures detailed traceback information.

    Attributes:
        error_message (str): The formatted error message.
    """

    def __init__(self, error_message, error_detail: sys):
        """
        Initializes the CustomException with a detailed error message.

        Args:
            error_message (str): The original error message.
            error_detail (sys): The sys module used to extract exception info.
        """
        super().__init__(error_message)
        self.error_message = error_message_detail(error_message, error_detail=error_detail)

    def __str__(self):
        """
        Returns the detailed error message as a string.

        Returns:
            str: Detailed error message with file and line number.
        """
        return self.error_message
