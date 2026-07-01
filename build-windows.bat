@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================
echo  Patent Keyword Search - Build Script
echo ============================================
echo.

echo (1/3) Installing Python dependencies...
pip install "setuptools<70" --quiet
pip install -r "backend\requirements.txt" pyinstaller
if errorlevel 1 (
    echo [ERROR] pip install failed - check Python/pip
    pause
    exit /b 1
)

echo.
echo (2/3) Building frontend...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed - check Node.js
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo [ERROR] npm run build failed
    pause
    exit /b 1
)
cd /d "%~dp0"

if not exist "frontend\dist\index.html" (
    echo [ERROR] frontend/dist/index.html not found
    pause
    exit /b 1
)

echo.
echo (3/3) Packaging into single exe...
cd /d "%~dp0"
pyinstaller --onefile --name PatentKeywordSearch --add-data "backend\data;data" --add-data "frontend\dist;frontend\dist" --hidden-import jieba.finalseg --hidden-import jieba.posseg --hidden-import jieba.analyse --hidden-import matplotlib.backends.backend_agg --collect-all jieba --collect-all wordcloud --clean backend\main.py

if exist "dist\PatentKeywordSearch.exe" (
    echo.
    echo ========================================
    echo  BUILD SUCCESSFUL
    echo  Output: dist\PatentKeywordSearch.exe
    echo ========================================
    echo.
    echo  Double-click dist\PatentKeywordSearch.exe
    echo  Browser will auto-open http://127.0.0.1:8000
    echo.
) else (
    echo.
    echo ========================================
    echo  BUILD FAILED
    echo  Check the error messages above.
    echo ========================================
    echo.
)

pause
