import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.upload import router as upload_router
from routers.keywords import router as keywords_router
from routers.search import router as search_router

app = FastAPI(title='专利交底书分析工具')

allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r'https://.*\.monkeycode-ai\.online',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(upload_router)
app.include_router(keywords_router)
app.include_router(search_router)


@app.get('/api/health')
async def health():
    return {'status': 'ok'}
