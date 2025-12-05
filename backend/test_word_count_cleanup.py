#!/usr/bin/env python3
"""Test script to verify word count limiting and cleanup functionality."""

import sys
sys.path.insert(0, '.')

from database import SessionLocal
import models
import uuid

def test_cleanup():
    """Create test articles and verify cleanup works."""
    db = SessionLocal()
    
    try:
        # Clean database
        db.query(models.ArticleCard).delete()
        db.commit()
        print("✓ Database cleaned")
        
        # Create test articles with large content
        test_articles = []
        for i in range(5):
            content = " ".join(["word"] * 1500)  # 1500 words each = 7500 total
            article = models.ArticleCard(
                id=str(uuid.uuid4()),
                topic_id="test-topic",
                title=f"Test Article {i+1}",
                summary="Test summary",
                content=content,
                word_count=1500,
                is_consumed=(i < 3),  # First 3 are consumed
                is_archived=(i >= 3)   # Last 2 are archived
            )
            db.add(article)
            test_articles.append(article)
        
        db.commit()
        print(f"✓ Created 5 test articles (7500 total words)")
        
        # Check total words before cleanup
        total_words = sum(a.word_count for a in db.query(models.ArticleCard).all())
        print(f"  Total words before cleanup: {total_words}")
        
        # Run cleanup (should remove ~2500 words)
        from main import cleanup_old_articles
        cleanup_old_articles()
        
        # Check after cleanup
        remaining = db.query(models.ArticleCard).all()
        total_words_after = sum(a.word_count for a in remaining)
        print(f"  Total words after cleanup: {total_words_after}")
        print(f"  Articles remaining: {len(remaining)}")
        
        if total_words_after <= 5000:
            print("✓ Cleanup successful - word count within limit")
        else:
            print(f"✗ Cleanup failed - still over limit ({total_words_after} > 5000)")
            
        # Show which articles remain
        for article in remaining:
            status = "consumed" if article.is_consumed else ("archived" if article.is_archived else "active")
            print(f"  - {article.title}: {article.word_count} words ({status})")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_cleanup()
