import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import models, schemas
from database import get_db
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-keep-it-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60 # 30 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

def verify_google_token(token: str):
    try:
        # Verify the token using Google's public keys
        # Note: In production, you should verify the 'aud' (audience) claim matches your Client ID
        id_info = id_token.verify_oauth2_token(token, requests.Request())
        
        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
            
        return id_info
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")
