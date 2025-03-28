import streamlit as st
from pathlib import Path

st.set_page_config(
    page_title="Stock Fetcher",
    layout="wide",
    initial_sidebar_state="expanded"
)

def main():
    st.title("📊 Stock Price Fetcher")
    
    # Display the HTML/JS app
    with open("index.html", "r") as f:
        html_content = f.read()
    
    # Corrected component call (remove 'sanitize' parameter)
    st.components.v1.html(
        html_content,
        height=800,
        scrolling=True,
        width=None
    )

if __name__ == "__main__":
    main()
