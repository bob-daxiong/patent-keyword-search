from fastapi import APIRouter
from pydantic import BaseModel

from services.ipc_predictor import IPCPredictor
from services.query_generator import QueryGenerator
from services.patent_search import PatentSearchAdapter

router = APIRouter(prefix='/api', tags=['search'])

_ipc_predictor = IPCPredictor()
_query_generator = QueryGenerator()
_patent_search = PatentSearchAdapter()


class QueryRequest(BaseModel):
    text: str
    keywords: list[str]


class SearchRequest(BaseModel):
    query_id: str
    query_text: str
    databases: list[str]


@router.post('/search-queries')
async def generate_queries(request: QueryRequest):
    ipc_predictions = _ipc_predictor.predict(request.keywords)
    keyword_dicts = [{'word': kw, 'count': 0, 'weight': 1.0} for kw in request.keywords]
    queries = _query_generator.generate(keyword_dicts, ipc_predictions)
    return {
        'ipc_predictions': ipc_predictions,
        'queries': queries
    }


@router.post('/search')
async def search_patents(request: SearchRequest):
    urls = _patent_search.build_search_urls(request.query_text, request.databases)
    patent_results: list[dict] = []
    if 'google' in request.databases:
        patent_results = await _patent_search.fetch_google_patents_results(request.query_text)
    return {
        'query_id': request.query_id,
        'query_text': request.query_text,
        'search_urls': urls,
        'patent_results': patent_results
    }
