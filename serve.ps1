$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.IgnoreWriteExceptions = $true
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.png'  = 'image/png'
  '.pdf'  = 'application/pdf'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response

  $localPath = $req.Url.LocalPath.TrimStart('/')
  if ($localPath -eq '') { $localPath = 'index.html' }
  $filePath = Join-Path $root $localPath

  try {
    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $ct = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $res.StatusCode = 200
      $res.ContentType = $ct
      $res.ContentLength64 = $bytes.Length
      if ($req.HttpMethod -ne 'HEAD') {
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } else {
      $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $res.StatusCode = 404
      $res.ContentType = 'text/plain'
      $res.ContentLength64 = $body.Length
      if ($req.HttpMethod -ne 'HEAD') {
        $res.OutputStream.Write($body, 0, $body.Length)
      }
    }
  } catch {
    Write-Host "Error serving /$localPath : $_"
  } finally {
    try { $res.OutputStream.Flush() } catch {}
    try { $res.Close() } catch {}
  }
}
