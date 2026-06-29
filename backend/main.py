from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.upload import router as upload_router
from routers.keywords import router as keywords_router
from routers.search import router as search_router

app = FastAPI(title='专利交底书分析工具')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
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
