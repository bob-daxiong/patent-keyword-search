import os
import tempfile

UPLOAD_DIR = os.path.join(tempfile.gettempdir(), 'patent-tool')
os.makedirs(UPLOAD_DIR, exist_ok=True, mode=0o600)

MAX_FILE_SIZE = 20 * 1024 * 1024

ALLOWED_EXTENSIONS = {'.doc', '.docx'}

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
STOPWORDS_PATH = os.path.join(DATA_DIR, 'stopwords.txt')
PATENT_TERMS_PATH = os.path.join(DATA_DIR, 'patent_terms.txt')
IPC_INDEX_PATH = os.path.join(DATA_DIR, 'ipc_index.json')
