from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Google Subject ID
    email = Column(String, unique=True, index=True)
    name = Column(String)
    picture = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    topics = relationship("Topic", back_populates="user")
    articles = relationship("ArticleCard", back_populates="user")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    query = Column(String, index=True)
    icon = Column(String)
    
    user = relationship("User", back_populates="topics")
    articles = relationship("ArticleCard", back_populates="topic")

class ArticleCard(Base):
    __tablename__ = "articles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id"))
    title = Column(String)
    summary = Column(String)
    content = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    published_date = Column(String, nullable=True)
    citations = Column(JSON, default=list)
    is_archived = Column(Boolean, default=False)
    is_read = Column(Boolean, default=False)
    is_consumed = Column(Boolean, default=False)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="articles")
    topic = relationship("Topic", back_populates="articles")
