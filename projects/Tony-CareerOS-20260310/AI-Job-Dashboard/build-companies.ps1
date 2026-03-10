$companies = @(
    "Origami Robotics",
    "Carrot Labs",
    "Arga Labs",
    "Unifold",
    "Rubric AI",
    "GrazeMate",
    "Aurorin CAD",
    "Librar Labs"
)

$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"
$data = @()

foreach ($company in $companies) {
    $data += [PSCustomObject]@{
        name = $company
        description = ""
        fit = ""
        fitBadge = "Unknown Fit"
        website = ""
        linkedin = ""
        jobs = ""
        score = 0
        status = "not-started"
        approach = ""
        resumeAngle = ""
        pros = @()
        cons = @()
        tags = @()
        tasks = @(
            @{ label = "Research founder"; done = $false },
            @{ label = "Tailor resume"; done = $false },
            @{ label = "Apply"; done = $false },
            @{ label = "Send outreach"; done = $false }
        )
        notes = ""
        updatedAt = $timestamp
        source = "Current scrape"
    }
}

$data | ConvertTo-Json -Depth 8 | Set-Content -Path ".\companies.json" -Encoding UTF8

Write-Host "companies.json created successfully"
