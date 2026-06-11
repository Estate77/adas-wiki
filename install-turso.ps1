$response = Invoke-WebRequest -Uri 'https://api.github.com/repos/tursodatabase/turso-cli/releases/latest'
$data = $response.Content | ConvertFrom-Json
$asset = $data.assets | Where-Object { $_.name -like '*windows*amd64*' }
$url = $asset.browser_download_url
Write-Host "Downloading from: $url"

Invoke-WebRequest -Uri $url -OutFile 'turso.zip'
Expand-Archive -Path 'turso.zip' -DestinationPath '.'
Move-Item -Path 'turso.exe' -Destination 'C:\Windows\System32\turso.exe' -Force -ErrorAction SilentlyContinue
Remove-Item -Path 'turso.zip' -Force

Write-Host "Turso CLI installed successfully!"
turso --version