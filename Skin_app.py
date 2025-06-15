import streamlit as st
from ultralytics import YOLO
from PIL import Image
import numpy as np
import cv2

st.set_page_config("Skin Issue Detection", layout="centered")

st.title("Skin Issue Detection")

st.divider()

# Upload the image
img = st.file_uploader("Upload Image", type=["jpeg", "jpg"])

# Load the YOLO model
model = YOLO("D:\Personal projects\Medical_Chatbot\src\Components\Skin_issue_Detection\best_model84.pt")

if img:
    # Open the image file and run prediction
    img_pil = Image.open(img)
    response = model.predict(img_pil)

    st.markdown("Skin issue:")
    
    # Convert the image with bounding boxes (BGR to RGB if needed)
    result_img_bgr = response[0].plot()  # This might return the image in BGR format
    result_img_rgb = cv2.cvtColor(result_img_bgr, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
    
    # Display the image with bounding boxes
    st.image(result_img_rgb)  # Display the image in RGB format
