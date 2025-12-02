from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import engine, get_db
from services.gemini_service import generate_article_content
import uuid

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Crawler Backend API"}

# Topics
@app.get("/topics", response_model=List[schemas.Topic])
def get_topics(db: Session = Depends(get_db)):
    return db.query(models.Topic).all()

@app.post("/topics", response_model=schemas.Topic)
def create_topic(topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    db_topic = models.Topic(**topic.dict())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

@app.delete("/topics/{topic_id}")
def delete_topic(topic_id: str, db: Session = Depends(get_db)):
    db_topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(db_topic)
    db.commit()
    return {"ok": True}

# Articles
@app.get("/feed", response_model=List[schemas.ArticleCard])
def get_feed(db: Session = Depends(get_db)):
    return db.query(models.ArticleCard).filter(models.ArticleCard.is_archived == False).all()

@app.get("/archive", response_model=List[schemas.ArticleCard])
def get_archive(db: Session = Depends(get_db)):
    return db.query(models.ArticleCard).filter(models.ArticleCard.is_archived == True).all()

@app.post("/articles/{article_id}/archive")
def archive_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(models.ArticleCard).filter(models.ArticleCard.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    article.is_archived = True
    db.commit()
    return {"ok": True}

@app.post("/generate/{topic_id}")
def generate_article(topic_id: str, db: Session = Depends(get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    content = generate_article_content(topic.query)
    if not content:
        raise HTTPException(status_code=500, detail="Failed to generate content")
        
    new_article = models.ArticleCard(
        id=str(uuid.uuid4()),
        topic_id=topic.id,
        title=content.get("title"),
        summary=content.get("summary"),
        source_url=content.get("source_url"),
        published_date=content.get("published_date"),
        citations=content.get("citations", []),
        image_url=f"https://picsum.photos/seed/{uuid.uuid4()}/400/200" # Placeholder
    )
    
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    return new_article
