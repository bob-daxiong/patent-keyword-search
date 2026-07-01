@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ============================================
echo  Patent Keyword Search - Build Script
echo  专利交底书分析工具 - 打包脚本
echo ============================================
echo.

echo [1/3] Installing Python dependencies...
pip install -r "%~dp0backend\requirements.txt" pyinstaller
if %errorlevel% neq 0 (
    echo [ERROR] pip install failed. Check Python and pip installation.
    echo          pip 安装失败，请检查 Python 和 pip 是否已安装
    pause
    exit /b 1
)

echo.
echo [2/3] Building frontend...
pushd "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed. Check Node.js installation.
    echo          npm install 失败，请检查 Node.js 是否已安装
    popd
    pause
    exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] npm run build failed.
    echo          前端构建失败
    popd
    pause
    exit /b 1
)
popd

if not exist "%~dp0frontend\dist\index.html" (
    echo [ERROR] Frontend build output not found.
    echo          前端构建产物未找到
    pause
    exit /b 1
)

echo.
echo [3/3] Packaging into exe...
pyinstaller --onefile ^
  --name "PatentKeywordSearch" ^
  --add-data "%~dp0backend\data;data" ^
  --add-data "%~dp0frontend\dist;frontend\dist" ^
  --hidden-import jieba.finalseg ^
  --hidden-import jieba.posseg ^
  --hidden-import jieba.analyse ^
  --hidden-import matplotlib.backends.backend_agg ^
  --collect-all jieba ^
  --collect-all wordcloud ^
  --clean ^
  "%~dp0backend\main.py"

if exist "%~dp0dist\PatentKeywordSearch.exe" (
    echo.
    echo ========================================
    echo   Build successful! / 打包完成!
    echo   Output: dist\PatentKeywordSearch.exe
    echo ========================================
    echo.
    echo   Double-click dist\PatentKeywordSearch.exe to run.
    echo   双击 dist\PatentKeywordSearch.exe 即可运行。
    echo   Browser will auto-open http://127.0.0.1:8000
    echo.
) else (
    echo.
    echo [ERROR] Build failed. Check the error messages above.
    echo          打包失败，请检查上方错误信息
    echo.
)

pause
