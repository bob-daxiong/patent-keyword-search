import os
import sys
import threading
import webbrowser
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routers.upload import router as upload_router
from routers.keywords import router as keywords_router
from routers.search import router as search_router

app = FastAPI(title='专利交底书分析工具')

allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
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


def _find_frontend_dist() -> Path | None:
    """Find the frontend dist directory. Supports both dev and PyInstaller modes."""
    candidates = [
        # PyInstaller bundle: relative to the executable
        Path(sys.executable).parent / 'frontend' / 'dist',
        # PyInstaller bundle: alongside main.py in the bundle
        Path(sys._MEIPASS) / 'frontend' / 'dist' if getattr(sys, '_MEIPASS', '') else None,
        # Dev mode: relative to backend directory
        Path(__file__).resolve().parent.parent / 'frontend' / 'dist',
        # Dev mode: relative to current working directory
        Path.cwd() / 'frontend' / 'dist',
    ]
    for candidate in candidates:
        if candidate and (candidate / 'index.html').exists():
            return candidate
    return None

FRONTEND_DIST = _find_frontend_dist()

if FRONTEND_DIST:
    app.mount('/assets', StaticFiles(directory=str(FRONTEND_DIST / 'assets')), name='assets')


@app.get('/{full_path:path}')
async def serve_frontend(full_path: str):
    if not FRONTEND_DIST:
        return {'message': 'Frontend not found. Run `cd frontend && npm run build` first.'}
    file_path = FRONTEND_DIST / full_path
    if full_path and file_path.exists():
        return FileResponse(str(file_path))
    return FileResponse(str(FRONTEND_DIST / 'index.html'))


if __name__ == '__main__':
    import uvicorn
    host = '127.0.0.1'
    port = 8000

    def _open_browser():
        webbrowser.open(f'http://{host}:{port}')

    threading.Timer(1.5, _open_browser).start()

    print(f'\n  专利交底书分析工具 已启动')
    print(f'  浏览器将自动打开: http://{host}:{port}\n')

    uvicorn.run(app, host=host, port=port, log_level='warning')
