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
    research_summary = ""
    all_citations = set()
    
    avoid_context = ""
    if previous_articles:
        titles = [a.get('title', 'Unknown') for a in previous_articles]
        avoid_context = (
            f"\nCRITICAL INSTRUCTION: You must AVOID repeating content from these recent articles: {', '.join(titles)}.\n"
            "Do not cover the same ground. Find NEW angles, NEW developments, or NEW research papers.\n"
            "If the topic is static, find a completely different perspective or deep dive into a specific sub-topic not covered before."
        )

    # 2 iterations of research (Total 3 calls including final write)
    for i in range(2):
        prompt = f"""
        You are a specialized research assistant investigating the topic: "{topic_query}".
        Current iteration: {i+1}/2.
        
        Context to Avoid (ALREADY COVERED - DO NOT REPEAT):
        {avoid_context}

        Previous Research Context:
        {research_summary if research_summary else "None (Start of research)"}
        
        Your task:
        1. Use Google Search to find the LATEST and MOST NOVEL information.
        2. Identify gaps or new angles to explore, specifically looking for quantitative data, statistics, and specific references.
        3. Provide a detailed summary of information for these new angles (simulate finding this info).
        4. Suggest what to look for next.
        
        Return a JSON object with this structure:
        {{
            "analysis": "Brief analysis of current state",
            "findings": "Detailed new information found in this step, including data points and potential citations",
            "next_steps": "What to research next"
        }}
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
                    # Check if grounding_chunks exists and is iterable
                    chunks = getattr(candidate.grounding_metadata, 'grounding_chunks', None)
                    if chunks:
                        for chunk in chunks:
                            if chunk.web and chunk.web.uri:
                                all_citations.add(chunk.web.uri)

            try:
                if not response.text:
                    logger.warning(f"Empty response text for step {i+1}")
                    step_content = {"findings": "No findings in this step due to empty response."}
                else:
                    # Try to parse JSON directly first
                    step_content = json.loads(response.text)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to clean the response or use raw text
                logger.warning(f"JSON parse failed for step {i+1}. Response text: {response.text[:500] if response.text else 'None'}")
                logger.warning(f"Attempting cleanup for step {i+1}")
                cleaned_text = response.text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:]
                elif cleaned_text.startswith("```"):
                    cleaned_text = cleaned_text[3:]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]
                try:
                    step_content = json.loads(cleaned_text)
                except json.JSONDecodeError:
                     logger.warning(f"Cleanup failed for step {i+1}, using raw text as findings")
                     step_content = {"findings": cleaned_text}
            except Exception as e:
                logger.error(f"Unexpected error parsing JSON for step {i+1}: {e}")
                step_content = {"findings": response.text}

            research_summary += f"\n\nStep {i+1} Findings:\n{step_content.get('findings', '')}"
            logger.debug(f"Completed research step {i+1}/2 for topic: {topic_query}")
        except Exception as e:
            logger.error(f"Error in research step {i+1} for topic '{topic_query}': {e}", exc_info=True)
            continue

    # Final step: Generate Article
    final_prompt = f"""
    You are a senior research analyst. Write a comprehensive, LONG-FORM research-based article about "{topic_query}" based on the following research.
    
    Research Context:
    {research_summary}
    
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
    
    Ensure the information is current, factual, and well-synthesized from the research.
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=final_prompt,
            config=generate_content_config
        )
        
        # Extract grounding metadata from final step
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                # Check if grounding_chunks exists and is iterable
                chunks = getattr(candidate.grounding_metadata, 'grounding_chunks', None)
                if chunks:
                    for chunk in chunks:
                        if chunk.web and chunk.web.uri:
                            all_citations.add(chunk.web.uri)

        try:
            if not response.text:
                    logger.warning("Empty response text for final step")
                    return None
            content = json.loads(response.text)
        except json.JSONDecodeError:
            logger.warning("JSON parse failed for final step, attempting cleanup")
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
                logger.error("Failed to parse final article JSON even after cleanup")
                return None
        except Exception as e:
            logger.error(f"Unexpected error parsing final JSON: {e}")
            return None
        
        # Merge citations
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
        logger.error(f"Error generating final content for topic '{topic_query}': {e}", exc_info=True)
        return None