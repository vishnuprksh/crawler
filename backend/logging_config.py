import logging
import logging.handlers
import os
import sys

def setup_logging():
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Root logger for the application
    logger = logging.getLogger("crawler_backend")
    logger.setLevel(logging.DEBUG)
    
    # Prevent adding handlers multiple times
    if logger.hasHandlers():
        return logger

    # Formatters
    standard_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(standard_formatter)
    logger.addHandler(console_handler)

    # Main App File Handler
    app_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'app.log'), maxBytes=10*1024*1024, backupCount=5
    )
    app_handler.setLevel(logging.DEBUG)
    app_handler.setFormatter(standard_formatter)
    logger.addHandler(app_handler)

    # Error File Handler
    error_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'error.log'), maxBytes=10*1024*1024, backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(standard_formatter)
    logger.addHandler(error_handler)

    # Article Activity Logger configuration
    article_logger = logging.getLogger("crawler_backend.articles")
    article_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'articles.log'), maxBytes=10*1024*1024, backupCount=5
    )
    article_handler.setLevel(logging.INFO)
    article_handler.setFormatter(standard_formatter)
    article_logger.addHandler(article_handler)
    # Propagate to root logger so it also shows up in app.log and console
    article_logger.propagate = True

    return logger

# Initialize loggers
logger = setup_logging()
article_logger = logging.getLogger("crawler_backend.articles")
