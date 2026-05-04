param(
    [string]$BackendUrl = "http://localhost:5000/",
    [string]$FrontendUrl = "http://localhost:5173/",
    [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $frontendDir "..")
$backendDir = Resolve-Path (Join-Path $repoRoot "backend")
$logsDir = Join-Path $scriptRoot "logs"

New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

function Wait-ForUrl {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][int]$Timeout
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    while ($stopwatch.Elapsed.TotalSeconds -lt $Timeout) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                Write-Host "Ready: $Url ($($response.StatusCode))"
                return
            }
        }
        catch {
            # Retry until timeout
        }

        [System.Threading.Thread]::Sleep(1500)
    }

    throw "Timeout waiting for URL: $Url"
}

$backendOut = Join-Path $logsDir "backend.out.log"
$backendErr = Join-Path $logsDir "backend.err.log"
$frontendOut = Join-Path $logsDir "frontend.out.log"
$frontendErr = Join-Path $logsDir "frontend.err.log"

$backendProcess = $null
$frontendProcess = $null

try {
    Write-Host "Starting backend in $backendDir"
    $backendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev") -WorkingDirectory $backendDir -PassThru -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr

    Wait-ForUrl -Url $BackendUrl -Timeout $TimeoutSeconds

    Write-Host "Starting frontend in $frontendDir"
    $frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev") -WorkingDirectory $frontendDir -PassThru -RedirectStandardOutput $frontendOut -RedirectStandardError $frontendErr

    Wait-ForUrl -Url $FrontendUrl -Timeout $TimeoutSeconds

    $venvCandidates = @(
        (Join-Path $scriptRoot ".venv\Scripts\python.exe"),
        (Join-Path $frontendDir ".venv\Scripts\python.exe"),
        (Join-Path $repoRoot ".venv\Scripts\python.exe")
    )

    $pythonExe = "python"
    foreach ($candidate in $venvCandidates) {
        if (Test-Path $candidate) {
            $pythonExe = $candidate
            break
        }
    }

    Write-Host "Running smoke tests with $pythonExe"
    Push-Location $scriptRoot
    & $pythonExe -m pytest tests -m smoke
    $testExitCode = $LASTEXITCODE
    Pop-Location

    if ($testExitCode -ne 0) {
        exit $testExitCode
    }
}
finally {
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        cmd /c "taskkill /PID $($frontendProcess.Id) /T /F" | Out-Null
    }

    if ($backendProcess -and -not $backendProcess.HasExited) {
        cmd /c "taskkill /PID $($backendProcess.Id) /T /F" | Out-Null
    }

    Write-Host "Stopped temporary backend/frontend processes."
    Write-Host "Logs are in: $logsDir"
}
