from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TopicBase(BaseModel):
    id: str
    query: str
    icon: str

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    class Config:
        from_attributes = True

class ArticleCardBase(BaseModel):
    id: str
    topic_id: Optional[str] = None
    title: str
    summary: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    published_date: Optional[str] = None
    citations: List[str] = []
    is_archived: bool = False
    is_read: bool = False
    is_consumed: bool = False
    word_count: int = 0
    created_at: Optional[datetime] = None

class ArticleCardCreate(ArticleCardBase):
    pass

class ArticleCard(ArticleCardBase):
    class Config:
        from_attributes = True
