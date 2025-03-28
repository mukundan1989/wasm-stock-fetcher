import streamlit as st
from pyodide.http import pyfetch
import asyncio
import json

# Set page title
st.set_page_config(page_title="Wasm Stock Fetcher")

# Title for the app
st.title("Wasm Stock Price Fetcher")

# Function to display the HTML app
def display_wasm_app():
    # Read the HTML file
    with open("index.html", "r") as f:
        html_content = f.read()
    
    # Display in Streamlit
    st.components.v1.html(html_content, width=800, height=600, scrolling=True)

# Main app
def main():
    st.sidebar.header("About")
    st.sidebar.info(
        "This app uses WebAssembly to fetch stock prices from Yahoo Finance "
        "and stores them in IndexedDB in your browser."
    )
    
    display_wasm_app()

if __name__ == "__main__":
    main()
