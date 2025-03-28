import streamlit as st
from pathlib import Path

st.set_page_config(page_title="Stock Fetcher", layout="wide")

def main():
    st.title("📊 Stock Price Fetcher")
    
    # Display the HTML/JS app
    with open("index.html", "r") as f:
        html_content = f.read()
    
    st.components.v1.html(html_content, height=800, scrolling=True)

if __name__ == "__main__":
    main()
