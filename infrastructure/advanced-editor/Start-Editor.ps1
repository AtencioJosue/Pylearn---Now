param(
    [ValidatePattern('^[a-z0-9][a-z0-9-]{0,30}$')][string]$WorkspaceId = "local",
    [ValidateRange(1024,65535)][int]$Port = 8080
)
$ErrorActionPreference = "Stop"
$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
$dockerPath = if ($dockerCommand) { $dockerCommand.Source } else { $null }
if (-not $dockerPath) {
    foreach ($candidate in @("C:\Program Files\Docker\Docker\resources\bin\docker.exe", "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe")) {
        if (Test-Path -LiteralPath $candidate) { $dockerPath = $candidate; break }
    }
}
if (-not $dockerPath) {
    throw "Docker Desktop no está instalado o no está en PATH. Instala Docker Desktop con WSL 2, reinicia Windows si lo solicita y abre Docker Desktop."
}
& $dockerPath info --format '{{.ServerVersion}}'
if ($LASTEXITCODE -ne 0) { throw "Abre Docker Desktop y espera a que el motor esté listo." }
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$localState = Join-Path $repoRoot ".local/advanced-editor/$WorkspaceId"
New-Item -ItemType Directory -Path $localState -Force | Out-Null
$secretPath = Join-Path $localState "password"
if (-not (Test-Path -LiteralPath $secretPath)) {
    $randomBytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($randomBytes) } finally { $rng.Dispose() }
    [System.IO.File]::WriteAllText($secretPath, [Convert]::ToBase64String($randomBytes), [System.Text.UTF8Encoding]::new($false))
}
$env:PYLEARN_EDITOR_SECRET = $secretPath
$env:PYLEARN_EDITOR_PORT = [string]$Port
$composePath = Join-Path $PSScriptRoot "compose.yaml"
& $dockerPath compose --project-name "pylearn-$WorkspaceId" --file $composePath up --build --detach
if ($LASTEXITCODE -ne 0) { throw "No se pudo iniciar el entorno. Revisa el error de Docker." }
$ready = $false
for ($attempt=0; $attempt -lt 40; $attempt++) {
    try {
        $health = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/healthz" -UseBasicParsing -TimeoutSec 2
        if ($health.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 500
}
if (-not $ready) { throw "El contenedor se inició pero todavía no responde. Revisa docker compose logs antes de abrirlo." }
Write-Host "Editor disponible en http://127.0.0.1:$Port"
Write-Host "Contraseña guardada en $secretPath"
Write-Host "Para conectar el enlace desde Pylearn, configura VITE_ADVANCED_EDITOR_URL=http://127.0.0.1:$Port en el .env.local del frontend y reinícialo."
Write-Host "Detener sin borrar proyectos: docker compose --project-name pylearn-$WorkspaceId --file `"$composePath`" stop"
