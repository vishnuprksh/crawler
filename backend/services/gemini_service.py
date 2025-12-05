import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid
import base64
from logging_config import logger, article_logger

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
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
)

def generate_article_image(title: str, summary: str) -> str:
    """Generate an image for the article based on title and summary. Returns a placeholder URL."""
    # Directly return a placeholder image as requested
    return _get_placeholder_image(title)

def _get_placeholder_image(seed: str) -> str:
    """Generate a deterministic placeholder image URL using the seed."""
    import hashlib
    seed_hash = hashlib.md5(seed.encode()).hexdigest()[:8]
    return f"https://picsum.photos/seed/{seed_hash}/400/200"

def generate_article_content(topic_query: str):
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not set")
        raise Exception("GEMINI_API_KEY not set")

    article_logger.info(f"Starting article generation for topic: {topic_query}")
    research_summary = ""
    
    # 4 iterations of research
    for i in range(4):
        prompt = f"""
        You are a research assistant investigating the topic: "{topic_query}".
        Current iteration: {i+1}/5.
        
        Previous Research Context:
        {research_summary if research_summary else "None (Start of research)"}
        
        Your task:
        1. Analyze what we know so far.
        2. Identify gaps or new angles to explore.
        3. Provide a detailed summary of information for these new angles (simulate finding this info).
        4. Suggest what to look for next.
        
        Return a JSON object with this structure:
        {{
            "analysis": "Brief analysis of current state",
            "findings": "Detailed new information found in this step",
            "next_steps": "What to research next"
        }}
        """
        
        try:
            response = model.generate_content(prompt)
            step_content = json.loads(response.text)
            research_summary += f"\n\nStep {i+1} Findings:\n{step_content.get('findings', '')}"
            logger.debug(f"Completed research step {i+1}/4 for topic: {topic_query}")
        except Exception as e:
            logger.error(f"Error in research step {i+1} for topic '{topic_query}': {e}", exc_info=True)
            continue

    # Final step: Generate Article
    final_prompt = f"""
    You are a senior journalist. Write a comprehensive news article about "{topic_query}" based on the following research.
    
    Research Context:
    {research_summary}
    
    Return a JSON object with the following structure:
    {{
        "title": "Catchy headline",
        "summary": "A concise summary of the news (2-3 sentences).",
        "source_url": "URL to the main source (if specific sources were mentioned, use one, otherwise a relevant domain)",
        "published_date": "YYYY-MM-DD",
        "citations": ["url1", "url2"]
    }}
    
    Ensure the information is current, factual, and well-synthesized from the research.
    """
    
    try:
        response = model.generate_content(final_prompt)
        content = json.loads(response.text)
        
        # Generate image
        if content.get('title') and content.get('summary'):
            image_url = generate_article_image(content['title'], content['summary'])
            if image_url:
                content['image_url'] = image_url
        
        article_logger.info(f"Successfully generated article: '{content.get('title')}' for topic: {topic_query}")
        return content
    except Exception as e:
        logger.error(f"Error generating final content for topic '{topic_query}': {e}", exc_info=True)
        return None
