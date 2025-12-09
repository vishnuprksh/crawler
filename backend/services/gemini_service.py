import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid
import base64
from logging_config import logger, article_logger

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# Configuration for the model
generate_content_config = types.GenerateContentConfig(
    thinking_config=types.ThinkingConfig(
        thinking_level="HIGH"
    ),
    temperature=0.7,
    top_p=0.95,
    top_k=40,
    max_output_tokens=8192,
    response_mime_type="application/json",
    tools=[types.Tool(google_search=types.GoogleSearch())]
)

MODEL_NAME = "gemini-3-pro-preview"

def generate_article_image(title: str, summary: str) -> str:
    """Generate an image for the article based on title and summary. Returns a placeholder URL."""
    # Directly return a placeholder image as requested
    return _get_placeholder_image(title)

def _get_placeholder_image(seed: str) -> str:
    """Generate a deterministic placeholder image URL using the seed."""
    import hashlib
    seed_hash = hashlib.md5(seed.encode()).hexdigest()[:8]
    return f"https://picsum.photos/seed/{seed_hash}/400/200"

def generate_article_content(topic_query: str, previous_articles: list = None):
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not set")
        raise Exception("GEMINI_API_KEY not set")

    article_logger.info(f"Starting article generation for topic: {topic_query}")
    all_citations = set()
    
    avoid_context = ""
    if previous_articles:
        titles = [a.get('title', 'Unknown') for a in previous_articles]
        avoid_context = (
            f"\nCRITICAL INSTRUCTION: You must AVOID repeating content from these recent articles: {', '.join(titles)}.\n"
            "Do not cover the same ground. Find NEW angles, NEW developments, or NEW research papers.\n"
            "If the topic is static, find a completely different perspective or deep dive into a specific sub-topic not covered before."
        )

    # Single comprehensive API call that handles research + synthesis
    prompt = f"""
    You are a senior research analyst tasked with researching and writing a comprehensive article about: "{topic_query}".
    
    Context to Avoid (ALREADY COVERED - DO NOT REPEAT):
    {avoid_context}
    
    Your task (complete in this single response):
    1. Use Google Search to find the LATEST and MOST NOVEL information about this topic.
    2. Identify multiple angles, quantitative data, statistics, and credible references.
    3. Synthesize the research into a well-structured, long-form article.
    4. Think deeply about the topic using your HIGH thinking level to ensure thorough analysis.
    
    Requirements:
    - Pure research focus (not just news summary).
    - Include quantitative data and statistics where possible.
    - Provide specific references/citations.
    - Length: CONCISE and FOCUSED (aim for 500 words, flexible based on content quality).
    - Structure: Use Markdown headers, bullet points, and clear sections.
    - NOVELTY: Ensure the content provides fresh insights and is not generic.
    
    Return a JSON object with the following structure:
    {{
        "title": "Descriptive and professional title",
        "summary": "A concise summary of the research (2-3 sentences).",
        "content": "The full detailed article text, formatted with sections if needed (use markdown).",
        "source_url": "URL to the main source (if specific sources were mentioned, use one, otherwise a relevant domain)",
        "published_date": "YYYY-MM-DD",
        "citations": ["url1", "url2"]
    }}
    
    Ensure the information is current, factual, and well-synthesized from your research.
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=generate_content_config
        )
        
        # Extract grounding metadata
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                chunks = getattr(candidate.grounding_metadata, 'grounding_chunks', None)
                if chunks:
                    for chunk in chunks:
                        if chunk.web and chunk.web.uri:
                            all_citations.add(chunk.web.uri)

        try:
            if not response.text:
                logger.warning("Empty response text")
                return None
            content = json.loads(response.text)
        except json.JSONDecodeError:
            logger.warning("JSON parse failed, attempting cleanup")
            cleaned_text = response.text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            try:
                content = json.loads(cleaned_text)
            except json.JSONDecodeError:
                logger.error("Failed to parse article JSON even after cleanup")
                return None
        except Exception as e:
            logger.error(f"Unexpected error parsing JSON: {e}")
            return None
        
        # Merge citations from grounding metadata with generated citations
        existing_citations = set(content.get('citations', []))
        final_citations = list(existing_citations.union(all_citations))
        content['citations'] = final_citations
        
        # Generate image
        if content.get('title') and content.get('summary'):
            image_url = generate_article_image(content['title'], content['summary'])
            if image_url:
                content['image_url'] = image_url
        
        article_logger.info(f"Successfully generated article: '{content.get('title')}' for topic: {topic_query}")
        return content
    except Exception as e:
        logger.error(f"Error generating content for topic '{topic_query}': {e}", exc_info=True)
        return None