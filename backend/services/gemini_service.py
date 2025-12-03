import os
import google.generativeai as genai
from google import genai as new_genai
from google.genai import types
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid
import base64

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
    model_name="gemini-3-pro-preview",
    generation_config=generation_config,
)

# New image generation client
image_client = None
if GEMINI_API_KEY:
    image_client = new_genai.Client(api_key=GEMINI_API_KEY)

def generate_article_image(title: str, summary: str) -> str:
    """Generate an image for the article based on title and summary."""
    if not image_client:
        return None
    
    # Create a descriptive prompt for the image
    prompt = f"Create a professional, engaging image that represents this news article: '{title}'. Key elements from the summary: {summary[:200]}..."
    
    try:
        # Using gemini-2.0-flash-exp which supports image generation
        response = image_client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=['IMAGE'],
            )
        )
        
        # Extract the image
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    # part.inline_data.data is bytes
                    b64_data = base64.b64encode(part.inline_data.data).decode('utf-8')
                    mime_type = part.inline_data.mime_type
                    return f"data:{mime_type};base64,{b64_data}"
        
        return None
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

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
    
    try:
        response = model.generate_content(prompt)
        content = json.loads(response.text)
        
        # Generate image
        if content.get('title') and content.get('summary'):
            image_url = generate_article_image(content['title'], content['summary'])
            if image_url:
                content['image_url'] = image_url
        
        return content
    except Exception as e:
        print(f"Error generating content: {e}")
        return None
