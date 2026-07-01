@echo off
REM ============================================
REM  专利交底书分析工具 - Windows 打包脚本
REM  在 Windows 上双击运行或在 PowerShell 中执行
REM ============================================
echo.
echo  [1/3] 安装 Python 依赖...
pip install -r backend\requirements.txt pyinstaller --break-system-packages
if %errorlevel% neq 0 (
    echo  依赖安装失败，请检查 Python 和 pip 是否已安装
    pause
    exit /b 1
)

echo.
echo  [2/3] 构建前端...
cd frontend
call npm install
call npm run build
cd ..
if not exist "frontend\dist\index.html" (
    echo  前端构建失败，请检查 Node.js 是否已安装
    pause
    exit /b 1
)

echo.
echo  [3/3] 打包为独立 .exe...
pyinstaller --onefile --name "PatentKeywordSearch" --add-data "backend\data;data" --add-data "frontend\dist;frontend\dist" --hidden-import jieba.finalseg --hidden-import jieba.posseg --hidden-import jieba.analyse --hidden-import matplotlib.backends.backend_agg --collect-all jieba --collect-all wordcloud --clean backend\main.py

if exist "dist\PatentKeywordSearch.exe" (
    echo.
    echo  ========================================
    echo   打包完成!
    echo   可执行文件: dist\PatentKeywordSearch.exe
    echo   大小: %~zA 字节
    echo  ========================================
    echo.
    echo  双击 dist\PatentKeywordSearch.exe 即可运行
    echo  浏览器会自动打开 http:127.0.0.1:8000
    echo.
) else (
    echo  打包失败，请检查上方错误信息
)

pause
