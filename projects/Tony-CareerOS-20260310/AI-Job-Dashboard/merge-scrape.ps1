param(
    [string]$CompaniesPath = ".\companies.json",
    [string]$ScrapePath = ".\scrape-output.json"
)

$ErrorActionPreference = "Stop"

function Merge-Company {
    param(
        $Company,
        $Scrape
    )

    if (-not $Scrape) {
        return $Company
    }

    if (-not $Company.website -and $Scrape.url) {
        $Company.website = $Scrape.url
    }

    if (-not $Company.jobs -and $Scrape.jobsUrl) {
        $Company.jobs = $Scrape.jobsUrl
    }

    if (-not $Company.description -and $Scrape.metaDescription) {
        $Company.description = $Scrape.metaDescription
    }

    if (-not $Company.notes) {
        $Company.notes = ""
    }

    if (-not $Company.tags) {
        $Company.tags = @()
    }

    if ($Scrape.source -and ($Company.tags -notcontains $Scrape.source)) {
        $Company.tags += $Scrape.source
    }

    $Company.updatedAt = $Scrape.scrapedAt
    $Company.source = "Merged scrape"

    return $Company
}

$companies = Get-Content $CompaniesPath -Raw | ConvertFrom-Json
$scraped = Get-Content $ScrapePath -Raw | ConvertFrom-Json

$merged = foreach ($company in $companies) {
    $match = $scraped | Where-Object { $_.company -eq $company.name } | Select-Object -First 1
    Merge-Company -Company $company -Scrape $match
}

$merged | ConvertTo-Json -Depth 8 | Set-Content -Path $CompaniesPath -Encoding UTF8
Write-Host "Merged scrape data into $CompaniesPath"
