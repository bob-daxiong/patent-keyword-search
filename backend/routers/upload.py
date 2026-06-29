import os
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from config import UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_EXTENSIONS
from services.doc_parser import parse_docx, cleanup_file

router = APIRouter(prefix='/api', tags=['upload'])


@router.post('/upload')
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or '')[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail='仅支持 Word 文档格式(.doc/.docx)')

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail='文件大小超过限制，请上传小于 20MB 的文件')

    if ext == '.doc':
        raise HTTPException(status_code=400, detail='暂不支持 .doc 格式，请转换为 .docx 后上传')

    file_id = uuid.uuid4().hex
    tmp_path = os.path.join(UPLOAD_DIR, f'{file_id}{ext}')
    with open(tmp_path, 'wb') as f:
        f.write(content)

    try:
        text = parse_docx(tmp_path)
    except Exception as e:
        cleanup_file(tmp_path)
        raise HTTPException(status_code=400, detail=f'文件解析失败: {str(e)}')

    cleanup_file(tmp_path)
    return {'filename': file.filename, 'text': text}
