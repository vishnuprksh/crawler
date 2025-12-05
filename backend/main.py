from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import engine, get_db, SessionLocal
from services.gemini_service import generate_article_content
import uuid
import random
from logging_config import logger, article_logger

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_article_buffer():
    # Check requirements in a short-lived session
    logger.debug("Checking article buffer status")
    db = SessionLocal()
    needed = 0
    topics_data = []
    try:
        count = db.query(models.ArticleCard).filter(
            models.ArticleCard.is_archived == False,
            models.ArticleCard.is_consumed == False
        ).count()
        
        target_count = 10
        if count < target_count:
            needed = target_count - count
            topics = db.query(models.Topic).all()
            topics_data = [{"id": t.id, "query": t.query} for t in topics]
            logger.info(f"Buffer low: {count}/{target_count} articles. Need {needed} more.")
        else:
            logger.debug(f"Buffer healthy: {count}/{target_count} articles.")
    except Exception as e:
        logger.error(f"Error checking article buffer: {e}", exc_info=True)
    finally:
        db.close()

    if needed == 0 or not topics_data:
        return

    # Generate articles without holding a DB connection
    for i in range(needed):
        topic_data = random.choice(topics_data)
        logger.info(f"Generating article {i+1}/{needed} for topic: {topic_data['query']}")
        try:
            content = generate_article_content(topic_data["query"])
            if content:
                # Save in a new short-lived session
                db_save = SessionLocal()
                try:
                    new_article = models.ArticleCard(
                        id=str(uuid.uuid4()),
                        topic_id=topic_data["id"],
                        title=content.get("title"),
                        summary=content.get("summary"),
                        source_url=content.get("source_url"),
                        published_date=content.get("published_date"),
                        citations=content.get("citations", []),
                        image_url=content.get("image_url"),
                        is_consumed=False
                    )
                    db_save.add(new_article)
                    db_save.commit()
                    article_logger.info(f"Saved new article: '{new_article.title}' (ID: {new_article.id})")
                except Exception as e:
                    logger.error(f"Error saving article to DB: {e}", exc_info=True)
                finally:
                    db_save.close()
        except Exception as e:
            logger.error(f"Error generating article loop: {e}", exc_info=True)
            continue

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup: initiating background buffer check")
    # Run in background to not block startup
    import threading
    threading.Thread(target=ensure_article_buffer).start()

@app.get("/")
def read_root():
    logger.debug("Root endpoint accessed")
    return {"message": "Crawler Backend API"}

# Topics
@app.get("/topics", response_model=List[schemas.Topic])
def get_topics(db: Session = Depends(get_db)):
    logger.debug("Fetching all topics")
    return db.query(models.Topic).all()

@app.post("/topics", response_model=schemas.Topic)
def create_topic(topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating new topic: {topic.query}")
    db_topic = models.Topic(**topic.dict())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

@app.delete("/topics/{topic_id}")
def delete_topic(topic_id: str, db: Session = Depends(get_db)):
    logger.info(f"Deleting topic: {topic_id}")
    db_topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not db_topic:
        logger.warning(f"Topic not found for deletion: {topic_id}")
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(db_topic)
    db.commit()
    return {"ok": True}

# Articles
@app.get("/feed", response_model=List[schemas.ArticleCard])
def get_feed(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    logger.debug("Fetching article feed")
    articles = db.query(models.ArticleCard).filter(
        models.ArticleCard.is_archived == False,
        models.ArticleCard.is_consumed == False
    ).limit(10).all()
    
    # Trigger buffer check
    background_tasks.add_task(ensure_article_buffer)
    
    return articles

@app.post("/articles/{article_id}/swipe")
def swipe_article(article_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    logger.info(f"Swiping article: {article_id}")
    article = db.query(models.ArticleCard).filter(models.ArticleCard.id == article_id).first()
    if not article:
        logger.warning(f"Article not found for swipe: {article_id}")
        raise HTTPException(status_code=404, detail="Article not found")
    
    article.is_consumed = True
    db.commit()
    
    background_tasks.add_task(ensure_article_buffer)
    return {"ok": True}

@app.get("/archive", response_model=List[schemas.ArticleCard])
def get_archive(db: Session = Depends(get_db)):
    logger.debug("Fetching archive")
    return db.query(models.ArticleCard).filter(models.ArticleCard.is_archived == True).all()

@app.post("/articles/{article_id}/archive")
def archive_article(article_id: str, db: Session = Depends(get_db)):
    logger.info(f"Archiving article: {article_id}")
    article = db.query(models.ArticleCard).filter(models.ArticleCard.id == article_id).first()
    if not article:
        logger.warning(f"Article not found for archive: {article_id}")
        raise HTTPException(status_code=404, detail="Article not found")
    article.is_archived = True
    db.commit()
    return {"ok": True}

@app.post("/generate/{topic_id}")
def generate_article(topic_id: str, db: Session = Depends(get_db)):
    logger.info(f"Manual generation requested for topic: {topic_id}")
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        logger.warning(f"Topic not found for generation: {topic_id}")
        raise HTTPException(status_code=404, detail="Topic not found")
    
    content = generate_article_content(topic.query)
    if not content:
        logger.error(f"Failed to generate content for topic: {topic.query}")
        raise HTTPException(status_code=500, detail="Failed to generate content")
        
    new_article = models.ArticleCard(
        id=str(uuid.uuid4()),
        topic_id=topic.id,
        title=content.get("title"),
        summary=content.get("summary"),
        source_url=content.get("source_url"),
        published_date=content.get("published_date"),
        citations=content.get("citations", []),
        image_url=content.get("image_url") or f"https://picsum.photos/seed/{uuid.uuid4()}/400/200"
    )
    
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    article_logger.info(f"Manually generated and saved article: '{new_article.title}'")
    return new_article
