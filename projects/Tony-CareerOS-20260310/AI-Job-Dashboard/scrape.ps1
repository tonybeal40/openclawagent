param(
    [string]$ConfigPath = ".\sources.json",
    [switch]$IncludeRobots
)

$ErrorActionPreference = "Stop"

function Get-MetaContent {
    param(
        [string]$Html,
        [string]$Pattern
    )

    $match = [regex]::Match($Html, $Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($match.Success) {
        return $match.Groups[1].Value.Trim()
    }

    return ""
}

function Get-FirstTitle {
    param([string]$Html)

    $match = [regex]::Match($Html, "<title[^>]*>(.*?)</title>", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($match.Success) {
        return ($match.Groups[1].Value -replace "\s+", " ").Trim()
    }

    return ""
}

function Get-VisibleTextPreview {
    param([string]$Html)

    $options = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    $withoutScripts = [regex]::Replace($Html, "<script[\s\S]*?</script>", "", $options)
    $withoutStyles = [regex]::Replace($withoutScripts, "<style[\s\S]*?</style>", "", $options)
    $text = [regex]::Replace($withoutStyles, "<[^>]+>", " ")
    $text = ($text -replace "\s+", " ").Trim()

    if ($text.Length -gt 420) {
        return $text.Substring(0, 420)
    }

    return $text
}

function Get-RobotsUrl {
    param([string]$Url)

    $uri = [System.Uri]$Url
    return "{0}://{1}/robots.txt" -f $uri.Scheme, $uri.Host
}

function Test-AllowedHost {
    param(
        [string]$Url,
        [string[]]$AllowedHosts
    )

    if (-not $AllowedHosts -or $AllowedHosts.Count -eq 0) {
        return $false
    }

    $host = ([System.Uri]$Url).Host.ToLowerInvariant()
    return $AllowedHosts | Where-Object { $_.ToLowerInvariant() -eq $host }
}

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$headers = @{
    "User-Agent" = $config.userAgent
}

$results = @()

foreach ($source in $config.sources) {
    if (-not $source.enabled) {
        continue
    }

    if (-not $source.url) {
        continue
    }

    if (-not (Test-AllowedHost -Url $source.url -AllowedHosts $source.allowedHosts)) {
        Write-Warning "Skipping $($source.company): URL host is not in allowedHosts."
        continue
    }

    Write-Host "Fetching $($source.company) -> $($source.url)"

    $entry = [ordered]@{
        company = $source.company
        source = $source.kind
        url = $source.url
        jobsUrl = $source.jobsUrl
        scrapedAt = (Get-Date).ToString("o")
        title = ""
        metaDescription = ""
        preview = ""
        statusCode = $null
        robotsUrl = ""
        robotsStatus = ""
        notes = $source.notes
        error = ""
    }

    try {
        $response = Invoke-WebRequest -Uri $source.url -Headers $headers -TimeoutSec $config.requestTimeoutSeconds -MaximumRedirection 5
        $entry.statusCode = [int]$response.StatusCode
        $html = [string]$response.Content
        $entry.title = Get-FirstTitle -Html $html
        $metaPattern = "<meta\s+name=[""'']description[""'']\s+content=[""'']([^""'']+)[""'']"
        $entry.metaDescription = Get-MetaContent -Html $html -Pattern $metaPattern
        $entry.preview = Get-VisibleTextPreview -Html $html

        if ($IncludeRobots) {
            $entry.robotsUrl = Get-RobotsUrl -Url $source.url
            try {
                $robotsResponse = Invoke-WebRequest -Uri $entry.robotsUrl -Headers $headers -TimeoutSec $config.requestTimeoutSeconds
                $entry.robotsStatus = "HTTP $([int]$robotsResponse.StatusCode)"
            } catch {
                $entry.robotsStatus = $_.Exception.Message
            }
        }
    } catch {
        $entry.error = $_.Exception.Message
    }

    $results += [PSCustomObject]$entry
    Start-Sleep -Milliseconds $config.delayMilliseconds
}

$results | ConvertTo-Json -Depth 6 | Set-Content -Path $config.outputPath -Encoding UTF8
Write-Host "Scrape output written to $($config.outputPath)"
