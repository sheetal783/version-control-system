# PowerShell script to test the global vcs CLI
# Run this after installing the CLI globally with `npm link`.
# Usage: Open PowerShell and run this file.

$workspaceRoot = Resolve-Path "..\"
Set-Location $workspaceRoot

$testRepo = Join-Path $workspaceRoot "test-repo"

Write-Host "Cleaning existing test repo if it exists..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $testRepo

Write-Host "Creating test repository folder..."
New-Item -ItemType Directory -Path $testRepo | Out-Null
Set-Location $testRepo

Write-Host "Initializing vcs repository..."
vcs init

Write-Host "Creating test file..."
"hello" | Out-File -FilePath test.txt -Encoding utf8

Write-Host "Adding files to staging..."
vcs add .

Write-Host "Committing changes..."
vcs commit "first commit"

Write-Host "Pushing commits to remote..."
vcs push

Write-Host "Demo complete. Use the commit hash printed from 'vcs commit' to revert if needed."
Write-Host "Example: vcs revert <hash>"
