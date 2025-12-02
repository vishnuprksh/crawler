import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

generation_config = {
    "temperature": 0.9,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
)

def generate_article_content(topic_query: str):
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not set")

    prompt = f"""
    You are a news aggregator. Search for the latest and most relevant news about "{topic_query}".
    
    Return a JSON object with the following structure:
    {{
        "title": "Catchy headline",
        "summary": "A concise summary of the news (2-3 sentences).",
        "source_url": "URL to the main source",
        "published_date": "YYYY-MM-DD",
        "citations": ["url1", "url2"]
    }}
    
    Ensure the information is current and factual.
    """
    
    # Note: In a real production scenario with Google Search Grounding, 
    # you would enable the tools configuration. For this prototype, 
    # we are simulating the structure.
    
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"Error generating content: {e}")
        return None
