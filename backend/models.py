from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from database import Base

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String, primary_key=True, index=True)
    query = Column(String, index=True)
    icon = Column(String)
    
    articles = relationship("ArticleCard", back_populates="topic")

class ArticleCard(Base):
    __tablename__ = "articles"

    id = Column(String, primary_key=True, index=True)
    topic_id = Column(String, ForeignKey("topics.id"))
    title = Column(String)
    summary = Column(String)
    image_url = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    published_date = Column(String, nullable=True)
    citations = Column(JSON, default=list)
    is_archived = Column(Boolean, default=False)
    is_read = Column(Boolean, default=False)

    topic = relationship("Topic", back_populates="articles")
