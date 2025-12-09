# Web App to Backend Integration Analysis

## Summary
The web app currently calls Gemini directly via `generateCardsForTopic()` to fetch article data. The backend is a FastAPI server with full topic and article management endpoints ready to be integrated. The integration requires replacing Gemini calls with backend API calls.

---

## 1. WEB APP CURRENT STATE

### API Calls Currently Made
**File:** `/workspaces/crawler/web/services/geminiService.ts`

The web app currently makes **direct Gemini API calls** instead of using a backend:

1. **searchTopic()** - Calls Gemini with Google Search grounding tool
   - Returns raw search text + grounding sources
   
2. **formatResultsToCards()** - Calls Gemini to structure results
   - Takes raw text, formats into card structure (title, teaser, content)
   - Returns `RawCardData[]` with 3 fields: title, teaser, content

3. **generateCardsForTopic()** - Orchestrator function
   - Calls both above functions
   - Enriches results with metadata (id, topicId, generatedAt, imageUrl, etc.)
   - Returns `ArticleCard[]` objects

### Data Being Fetched & Displayed

**File:** `/workspaces/crawler/web/types.ts`

```typescript
interface ArticleCard {
  id: string;
  topicId: string;
  topicQuery: string;
  title: string;
  teaser: string;           // Brief info
  content: string;          // Detailed text
  imageUrl: string;
  generatedAt: number;
  sources: GroundingSource[];
  isRead: boolean;
  isArchived: boolean;
}
```

### Web Components Using API Data

1. **Feed.tsx** - Displays cards with swipe interactions
   - Props: `cards`, `isLoading`, `onReadMore`, `onArchive`, `onDiscard`
   - Shows: title, teaser, imageUrl, topic query
   - Actions: Swipe right to archive, left to discard, tap to read full

2. **Archive.tsx** - Shows archived articles
   - Lists articles with images, titles, topics
   - Swipe left to delete

3. **TopicManager.tsx** - Add/remove topics
   - Props: `topics`, `onAddTopic`, `onRemoveTopic`
   - Simple CRUD for topics

4. **ArticleModal.tsx** - Shows full article content
   - Displays: title, content, sources

### How Topics & Cards Are Managed

**File:** `/workspaces/crawler/web/App.tsx`

- **Topics**: Stored in `state.topics` (in localStorage via storageService)
- **Cards**: Generated fresh daily when `lastFetchDate` changes
- **Flow**:
  1. Check if date changed → archive old cards
  2. For each topic, call `generateCardsForTopic(topic.id, topic.query)`
  3. Shuffle cards and set as active
  4. Store in localStorage

### Environment Variables & Config

Currently NO backend API configuration. The app expects:
- `process.env.API_KEY` for Gemini (in `geminiService.ts`)

**Needed for integration:**
- `REACT_APP_BACKEND_URL` or `VITE_BACKEND_URL` (since using Vite)

---

## 2. BACKEND CURRENT STATE

### Port & Configuration

**File:** `/workspaces/crawler/backend/main.py`

- **Server**: FastAPI with Uvicorn (default port: **8000**)
- **CORS**: Enabled for all origins (`allow_origins=["*"]`)
- **Middleware**: Already configured properly

### Available Endpoints

#### Topics (GET/POST/DELETE)
```
GET  /topics              → List all topics (response_model=List[schemas.Topic])
POST /topics              → Create topic (body: TopicCreate)
DELETE /topics/{topic_id} → Delete topic
```

#### Articles (GET/POST)
```
GET  /feed               → Get active articles (limit 5, not archived/consumed)
GET  /archive            → Get archived articles
POST /articles/{id}/swipe     → Mark article as consumed
POST /articles/{id}/archive   → Mark article as archived
DELETE /articles/{id}         → Delete article permanently
POST /generate/{topic_id}     → Generate new article for topic
```

### Data Models

**File:** `/workspaces/crawler/backend/models.py`

```python
class Topic(Base):
    id: String (PK)
    query: String
    icon: String
    articles: Relationship to ArticleCard

class ArticleCard(Base):
    id: String (PK)
    topic_id: String (FK)
    title: String
    summary: String
    content: Text (nullable)
    image_url: String (nullable)
    source_url: String (nullable)
    published_date: String (nullable)
    citations: JSON (default=list)
    is_archived: Boolean
    is_read: Boolean
    is_consumed: Boolean
    word_count: Integer
```

### Response Schemas

**File:** `/workspaces/crawler/backend/schemas.py`

```python
class Topic(TopicBase):
    id: str
    query: str
    icon: str

class ArticleCard(ArticleCardBase):
    id: str
    topic_id: Optional[str]
    title: str
    summary: str
    content: Optional[str]
    image_url: Optional[str]
    source_url: Optional[str]
    published_date: Optional[str]
    citations: List[str]
    is_archived: bool
    is_read: bool
    is_consumed: bool
    word_count: int
```

---

## 3. DATA TRANSFORMATION & MAPPING

### Current Web Types → Backend Models

| Web Field | Backend Field | Type | Notes |
|-----------|---------------|------|-------|
| `id` | `id` | string | ✓ Direct match |
| `topicId` | `topic_id` | string | ✓ Direct match |
| `topicQuery` | — | string | ✗ Not in backend (need to join with Topic.query) |
| `title` | `title` | string | ✓ Direct match |
| `teaser` | `summary` | string | ✓ Direct match |
| `content` | `content` | string | ✓ Direct match |
| `imageUrl` | `image_url` | string | ✓ Direct match |
| `generatedAt` | — | number | ✗ Not in backend (use article creation time or now()) |
| `sources` | `citations` | GroundingSource[] | ✗ Different structure (need mapping) |
| `isRead` | `is_read` | boolean | ✓ Direct match |
| `isArchived` | `is_archived` | boolean | ✓ Direct match |

### Data Transformation Needed

When fetching articles from backend, web must:

1. **Add `topicQuery`**: Fetch Topic data and extract `query` field
   - Need to either: include in response, or make separate call, or join in query

2. **Add `generatedAt`**: 
   - Backend doesn't track creation time
   - Option: Use `Date.now()` when returning to frontend
   - Option: Add `created_at` field to ArticleCard model

3. **Map `citations` → `sources`**:
   - Backend: `citations: List[str]` (just strings)
   - Web: `sources: GroundingSource[]` (objects with title/uri)
   - Option: Transform backend citations to match web format
   - Option: Add actual GroundingSource data to backend

4. **Skip Gemini-specific metadata**:
   - Backend has: `source_url`, `published_date` (better sourced from Gemini)
   - Web has: `imageUrl` (placeholder from picsum.photos)
   - Keep backend's real URLs

---

## 4. REQUIRED CHANGES FOR INTEGRATION

### 4.1 Backend Changes (Minor)

#### Add timestamp to ArticleCard model
**File:** `/workspaces/crawler/backend/models.py`

Add:
```python
from datetime import datetime

class ArticleCard(Base):
    # ... existing fields ...
    created_at = Column(DateTime, default=datetime.utcnow)  # NEW
```

#### Add startup migration
**File:** `/workspaces/crawler/backend/main.py`

In `migrate_word_counts()` function or separate migration:
```python
def migrate_created_at():
    """Populate created_at for existing articles."""
    db = SessionLocal()
    try:
        articles = db.query(models.ArticleCard).filter(
            models.ArticleCard.created_at == None
        ).all()
        
        if not articles:
            return
            
        for article in articles:
            article.created_at = datetime.utcnow()
        
        db.commit()
    finally:
        db.close()
```

### 4.2 Web App Changes (Major)

#### Create API Service
**File:** `/workspaces/crawler/web/services/apiService.ts` (NEW)

```typescript
const API_BASE_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Topics
export async function getTopics() { /* GET /topics */ }
export async function createTopic(query: string, icon: string) { /* POST /topics */ }
export async function deleteTopic(topicId: string) { /* DELETE /topics/{id} */ }

// Articles
export async function getFeed() { /* GET /feed */ }
export async function getArchive() { /* GET /archive */ }
export async function archiveArticle(articleId: string) { /* POST /articles/{id}/archive */ }
export async function swipeArticle(articleId: string) { /* POST /articles/{id}/swipe */ }
export async function deleteArticle(articleId: string) { /* DELETE /articles/{id} */ }
export async function generateArticle(topicId: string) { /* POST /generate/{id} */ }
```

#### Update App.tsx
**File:** `/workspaces/crawler/web/App.tsx`

Replace calls to `generateCardsForTopic()` with:
```typescript
// Replace:
// const newCards = await generateCardsForTopic(topic.id, topic.query);

// With:
const articles = await getFeed();
const enrichedCards = articles.map(article => ({
  ...article,
  topicQuery: /* fetch from topic or cache */,
  generatedAt: new Date(article.created_at).getTime(),
  sources: /* transform from citations */,
  teaser: article.summary,
}));
```

Replace topic management:
```typescript
// Instead of storing in localStorage
const topics = await getTopics();

// Instead of generateCardsForTopic
await createTopic(query, icon);
// and fetch feed
```

#### Update TopicManager.tsx
**File:** `/workspaces/crawler/web/components/TopicManager.tsx`

Replace local state with API calls:
```typescript
const handleAddTopic = async (query: string) => {
  await createTopic(query, "tag");  // Call API
  const updatedTopics = await getTopics();  // Refresh
  // Update state with API response
};

const handleRemoveTopic = async (id: string) => {
  await deleteTopic(id);  // Call API
  const updatedTopics = await getTopics();  // Refresh
  // Update state
};
```

#### Update Feed Actions
**File:** `/workspaces/crawler/web/App.tsx`

Replace local state updates with API calls:
```typescript
const handleArchiveCard = async (cardId: string) => {
  await archiveArticle(cardId);  // Call API
  const updatedFeed = await getFeed();  // Refresh
  setState(prev => ({ ...prev, activeCards: updatedFeed }));
};

const handleDiscardCard = async (cardId: string) => {
  await swipeArticle(cardId);  // Mark as consumed
  const updatedFeed = await getFeed();  // Refresh
  setState(prev => ({ ...prev, activeCards: updatedFeed }));
};
```

#### Update Storage Service
**File:** `/workspaces/crawler/web/services/storageService.ts`

Instead of persisting full state, only cache:
```typescript
// Cache topics & archive locally (optional)
// But fetch feed from backend on each load
// Only store: lastFetchDate, selectedCard, etc.
```

---

## 5. EXACT CHANGES NEEDED - FILE BY FILE

### 5.1 Backend Files

#### `/workspaces/crawler/backend/models.py`
- Add `created_at` column to `ArticleCard`

#### `/workspaces/crawler/backend/main.py`
- Add `migrate_created_at()` function
- Call it in `startup_event()`
- Optionally: Add `/articles/{article_id}` GET endpoint to fetch single article

#### `/workspaces/crawler/backend/schemas.py`
- Add `created_at` field to `ArticleCard` schema

### 5.2 Web Files

#### `/workspaces/crawler/web/services/apiService.ts` (NEW FILE)
- Create new service with all API functions
- Set `API_BASE_URL` from env var
- Handle errors and logging

#### `/workspaces/crawler/web/.env.local` (NEW FILE)
```
VITE_BACKEND_URL=http://localhost:8000
```

#### `/workspaces/crawler/web/components/TopicManager.tsx`
- Replace local state management with API calls
- Call `getTopics()` in useEffect on mount
- Call `createTopic()` on form submit
- Call `deleteTopic()` on delete button

#### `/workspaces/crawler/web/App.tsx`
- Replace `generateCardsForTopic()` calls with `getFeed()`
- Replace `loadState()` to load topics from API
- Replace `saveState()` to persist only essential state
- Update `handleArchiveCard()` to call `archiveArticle()`
- Update `handleDiscardCard()` to call `swipeArticle()`
- Update `handleAddTopic()` to call `createTopic()`
- Update `handleRemoveTopic()` to call `deleteTopic()`

#### `/workspaces/crawler/web/components/Archive.tsx`
- Update to fetch archive from `getArchive()` API
- Update delete button to call `deleteArticle()`

#### `/workspaces/crawler/web/services/storageService.ts`
- Remove persistence of topics (fetch from API)
- Optionally keep localStorage for UI state (selected card, active tab)

#### `/workspaces/crawler/web/services/geminiService.ts`
- Keep for now (may use for future local features)
- Or remove entirely if not needed

---

## 6. INTEGRATION CHECKLIST

- [ ] Backend: Add `created_at` to ArticleCard model
- [ ] Backend: Add migration function for `created_at`
- [ ] Backend: Update schemas to include `created_at`
- [ ] Backend: Test all endpoints with Postman/curl
- [ ] Web: Create `apiService.ts` with all endpoints
- [ ] Web: Create `.env.local` with backend URL
- [ ] Web: Update `App.tsx` to use API instead of Gemini
- [ ] Web: Update `TopicManager.tsx` to use API
- [ ] Web: Update `Feed.tsx` to work with API data
- [ ] Web: Update `Archive.tsx` to use API
- [ ] Web: Test with backend running
- [ ] Web: Handle API errors gracefully
- [ ] Web: Add loading states for API calls

---

## 7. DATA STRUCTURE EXAMPLE - BEFORE & AFTER

### Before (Gemini-based)
```typescript
// Web generates locally
const card = {
  id: "uuid",
  topicId: "uuid",
  topicQuery: "AI breakthroughs",
  title: "OpenAI Releases GPT-5",
  teaser: "Revolutionary new model...",
  content: "Detailed article content...",
  imageUrl: "https://picsum.photos/...",
  generatedAt: Date.now(),
  sources: [{title: "...", uri: "..."}],
  isRead: false,
  isArchived: false,
};
```

### After (Backend-based)
```typescript
// Backend returns
const backendArticle = {
  id: "uuid",
  topic_id: "uuid",
  title: "OpenAI Releases GPT-5",
  summary: "Revolutionary new model...",
  content: "Detailed article content...",
  image_url: "https://actual-url/image.jpg",
  source_url: "https://source.com",
  published_date: "2025-01-15",
  citations: ["Citation 1", "Citation 2"],
  is_archived: false,
  is_read: false,
  is_consumed: false,
  word_count: 500,
  created_at: "2025-01-15T10:30:00"
};

// Web transforms to internal format
const card = {
  ...backendArticle,
  topicId: backendArticle.topic_id,
  topicQuery: "AI breakthroughs", // From cached Topic
  teaser: backendArticle.summary,
  content: backendArticle.content,
  imageUrl: backendArticle.image_url,
  generatedAt: new Date(backendArticle.created_at).getTime(),
  sources: backendArticle.citations.map(c => ({title: c, uri: ""})),
  isRead: backendArticle.is_read,
  isArchived: backendArticle.is_archived,
};
```

---

## 8. ENDPOINTS SUMMARY TABLE

| Operation | Current (Gemini) | Backend Endpoint | Notes |
|-----------|------------------|------------------|-------|
| Get topics | localStorage | GET /topics | Returns: Topic[] |
| Add topic | localStorage | POST /topics | Body: {query, icon} |
| Remove topic | localStorage | DELETE /topics/{id} | — |
| Get articles | generateCardsForTopic() (Gemini) | GET /feed | Returns: ArticleCard[] (limit 5) |
| Archive article | localStorage | POST /articles/{id}/archive | — |
| Discard article | localStorage | POST /articles/{id}/swipe | Marks as consumed |
| View archive | localStorage | GET /archive | Returns: ArticleCard[] |
| Delete article | localStorage | DELETE /articles/{id} | — |

