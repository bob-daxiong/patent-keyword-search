import os
import sys
import tempfile

UPLOAD_DIR = os.path.join(tempfile.gettempdir(), 'patent-tool')
os.makedirs(UPLOAD_DIR, exist_ok=True, mode=0o600)

MAX_FILE_SIZE = 20 * 1024 * 1024

ALLOWED_EXTENSIONS = {'.doc', '.docx'}

# Support both dev mode and PyInstaller bundle
if getattr(sys, '_MEIPASS', ''):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(__file__)

DATA_DIR = os.path.join(BASE_DIR, 'data')
STOPWORDS_PATH = os.path.join(DATA_DIR, 'stopwords.txt')
PATENT_TERMS_PATH = os.path.join(DATA_DIR, 'patent_terms.txt')
IPC_INDEX_PATH = os.path.join(DATA_DIR, 'ipc_index.json')
