$ErrorActionPreference = "Stop"

Write-Host "Setting up test cases..."
mkdir -Force c:\temp\review_tests | Out-Null
mkdir -Force c:\temp\review_tests\case1 | Out-Null
mkdir -Force c:\temp\review_tests\case2 | Out-Null
mkdir -Force c:\temp\review_tests\case3 | Out-Null

# Case 1: missing README, LICENSE, CI
Set-Content -Path "c:\temp\review_tests\case1\package.json" -Value "{}"
Compress-Archive -Path c:\temp\review_tests\case1\* -DestinationPath c:\temp\review_tests\test1.zip -Force

# Case 2: .env committed
Set-Content -Path "c:\temp\review_tests\case2\.env" -Value "SECRET=123"
Compress-Archive -Path c:\temp\review_tests\case2\* -DestinationPath c:\temp\review_tests\test2.zip -Force

# Case 3: node_modules committed
mkdir -Force c:\temp\review_tests\case3\node_modules | Out-Null
Set-Content -Path "c:\temp\review_tests\case3\node_modules\test.txt" -Value "test" # Ensure directory is not empty for zip
Compress-Archive -Path c:\temp\review_tests\case3\* -DestinationPath c:\temp\review_tests\test3.zip -Force

function Test-Upload {
    param([string]$FilePath)
    Write-Host "Uploading $FilePath..."
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:3001/analyze/upload" -Method Post -Form @{ file = Get-Item $FilePath }
    $jobId = $response.jobId
    Write-Host "Uploaded, jobId: $jobId. Waiting for processing..."
    
    # Poll for result
    for ($i = 0; $i -lt 10; $i++) {
        Start-Sleep -Seconds 2
        try {
            $status = Invoke-RestMethod -Uri "http://127.0.0.1:3001/jobs/$jobId/status" -ErrorAction Stop
            if ($status.status -eq "done" -and $status.hasResult) {
                $result = Invoke-RestMethod -Uri "http://127.0.0.1:3001/jobs/$jobId"
                return $result
            }
        } catch {
            Write-Host "Waiting..."
        }
    }
    throw "Timeout waiting for job $jobId"
}

Write-Host "----- Testing Case 1: Missing README, LICENSE, CI -----"
$res1 = Test-Upload "c:\temp\review_tests\test1.zip"
$findings1 = $res1.findings | ForEach-Object { $_.ruleId }
Write-Host "Findings: $($findings1 -join ', ')"
if ("R010" -in $findings1 -and "R011" -in $findings1 -and "R012" -in $findings1) {
    Write-Host "OK: Case 1 passed." -ForegroundColor Green
} else {
    Write-Host "FAIL: Expected R010, R011, R012" -ForegroundColor Red
}

Write-Host "----- Testing Case 2: .env committed -----"
$res2 = Test-Upload "c:\temp\review_tests\test2.zip"
$findings2 = $res2.findings | ForEach-Object { $_.ruleId }
Write-Host "Findings: $($findings2 -join ', ')"
if ("R013" -in $findings2) {
    Write-Host "OK: Case 2 passed." -ForegroundColor Green
} else {
    Write-Host "FAIL: Expected R013" -ForegroundColor Red
}

Write-Host "----- Testing Case 3: node_modules committed -----"
$res3 = Test-Upload "c:\temp\review_tests\test3.zip"
$findings3 = $res3.findings | ForEach-Object { $_.ruleId }
Write-Host "Findings: $($findings3 -join ', ')"
if ("R014" -in $findings3) {
    Write-Host "OK: Case 3 passed." -ForegroundColor Green
} else {
    Write-Host "FAIL: Expected R014" -ForegroundColor Red
}
