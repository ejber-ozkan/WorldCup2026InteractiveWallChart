$ErrorActionPreference = "Stop"

$flags = @(
    "ar", "at", "au", "ba", "be", "br", "ca", "cd", "ch", "ci", "co", "cv",
    "cw", "cz", "de", "dz", "ec", "eg", "es", "fr", "gb-eng", "gb-sct",
    "gh", "hr", "ht", "iq", "ir", "jo", "jp", "kr", "ma", "mx", "nl",
    "no", "nz", "pa", "pt", "py", "qa", "sa", "se", "sn", "tn", "tr",
    "us", "uy", "uz", "za"
)

$root = Split-Path -Parent $PSScriptRoot
$targetDir = Join-Path $root "assets\flags"
New-Item -ItemType Directory -Force $targetDir | Out-Null

foreach ($flag in $flags) {
    $url = "https://flagcdn.com/$flag.svg"
    $target = Join-Path $targetDir "$flag.svg"
    Invoke-WebRequest -Uri $url -OutFile $target
    Write-Host "Downloaded $flag.svg"
}
