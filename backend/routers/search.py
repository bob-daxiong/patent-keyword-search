from fastapi import APIRouter
from pydantic import BaseModel

from services.ipc_predictor import IPCPredictor
from services.query_generator import QueryGenerator
from services.keyword_extractor import KeywordExtractor
from services.patent_search import PatentSearchAdapter

router = APIRouter(prefix='/api', tags=['search'])

_ipc_predictor = IPCPredictor()
_query_generator = QueryGenerator()
_patent_search = PatentSearchAdapter()
_keyword_extractor = KeywordExtractor()


class KeywordItem(BaseModel):
    word: str
    weight: float = 1.0


class QueryRequest(BaseModel):
    text: str
    keywords: list[KeywordItem]

    def get_weighted_keywords(self) -> list[dict]:
        """Return keyword dicts with weights. Falls back to extraction if no weights."""
        if self.keywords and any(kw.weight != 1.0 for kw in self.keywords):
            return [{'word': kw.word, 'count': 0, 'weight': kw.weight} for kw in self.keywords]
        # If all weights are 1.0 (not provided by frontend), re-extract with proper weights
        words = [kw.word for kw in self.keywords]
        if self.text:
            extracted = _keyword_extractor.extract(self.text, top_n=len(words))
            word_weight_map = {e['word']: e['weight'] for e in extracted}
            return [{'word': kw.word, 'count': 0, 'weight': word_weight_map.get(kw.word, 1.0)} for kw in self.keywords]
        return [{'word': kw.word, 'count': 0, 'weight': 1.0} for kw in self.keywords]


class SearchRequest(BaseModel):
    query_id: str
    query_text: str
    databases: list[str]


@router.post('/search-queries')
async def generate_queries(request: QueryRequest):
    keyword_dicts = request.get_weighted_keywords()
    keyword_words = [kw['word'] for kw in keyword_dicts]
    ipc_predictions = _ipc_predictor.predict(keyword_words)
    queries = _query_generator.generate(keyword_dicts, ipc_predictions)
    return {
        'ipc_predictions': ipc_predictions,
        'queries': queries
    }


@router.post('/search')
async def search_patents(request: SearchRequest):
    urls = _patent_search.build_search_urls(request.query_text, request.databases)
    patentResults: list[dict] = []
    if 'google' in request.databases:
        patentResults = await _patent_search.fetch_google_patents_results(request.query_text)
    return {
        'queryId': request.query_id,
        'queryText': request.query_text,
        'searchUrls': urls,
        'patentResults': patentResults
    }
