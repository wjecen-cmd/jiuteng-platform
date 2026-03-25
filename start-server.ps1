# 九藤平台启动脚本
# 后端服务 - 端口 3001
Start-Process -FilePath "node" -ArgumentList "-e", "require('tsx').run('./src/index.ts')" -WorkingDirectory "C:\Users\Administrator\.openclaw\workspace\jiuteng-platform-integrated\server" -WindowStyle Hidden

# 前端服务 - 端口 3002
Start-Process -FilePath "node" -ArgumentList "C:\Users\Administrator\.openclaw\workspace\jiuteng-platform-integrated\web\node_modules\next\dist\bin\next", "start", "-p", "3002" -WorkingDirectory "C:\Users\Administrator\.openclaw\workspace\jiuteng-platform-integrated\web" -WindowStyle Hidden

Write-Host "Services started on ports 3001 and 3002"