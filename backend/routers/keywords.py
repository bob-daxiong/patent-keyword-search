from fastapi import APIRouter
from pydantic import BaseModel

from services.keyword_extractor import KeywordExtractor
from services.wordcloud_gen import generate_wordcloud_image

router = APIRouter(prefix='/api', tags=['keywords'])

_extractor = KeywordExtractor()


class KeywordRequest(BaseModel):
    text: str
    top_n: int = 30


@router.post('/keywords')
async def extract_keywords(request: KeywordRequest):
    keywords = _extractor.extract(request.text, request.top_n)
    return {'keywords': keywords}


class WordCloudRequest(BaseModel):
    keywords: list[dict]


@router.post('/wordcloud')
async def wordcloud(request: WordCloudRequest):
    image_base64 = generate_wordcloud_image(request.keywords)
    return {'image': image_base64}
