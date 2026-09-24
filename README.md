# CFPB Complaint Intelligence Platform

> An end-to-end machine learning and inference platform built on the
> Consumer Financial Protection Bureau (CFPB) Consumer Complaint
> Database.

## Live Application

-   Frontend: \[https://cfpb-complaint-intelligence-platfor.vercel.app/\]
-   Backend API: \[https://cfpb-complaint-intelligence-platform.onrender.com/\]
-   Swagger UI: \[https://cfpb-complaint-intelligence-platform.onrender.com/docs\]
-   GitHub: \[https://github.com/Gurunagesh/CFPB-COMPLAINT-INTELLIGENCE-PLATFORM\]

## Project Overview

This project converts CFPB consumer complaint data into an end-to-end ML
inference platform:

``` text
CFPB Data
   ↓
Data Understanding / Validation / EDA
   ↓
Leakage Analysis / Feature Design
   ↓
┌──────────────────────────────┐
│ Project 1: Product           │
│ Classification               │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Project 2: Triage Latency    │
│ Prediction (Experimental)    │
└──────────────┬───────────────┘
               ↓
        Frozen ML Artifacts
               ↓
            FastAPI
               ↓
         Docker / Render
               ↓
        Next.js / Vercel
```

The project intentionally separates prediction from operational
decision-making. Project 2 is explicitly experimental because its final
model did not outperform a simple baseline.

## Dataset

Source: \[https://www.consumerfinance.gov/data-research/consumer-complaints/\] CFPB Consumer Complaint Database.

Extract used:

-   Window: March 1, 2026 -- September 1, 2026
-   Narrative filter: `has_narrative=true`
-   `In progress` company-response records excluded
-   Raw data: **81,946 rows × 16 columns**
-   Complaint IDs: **81,946 unique**
-   Narratives: **81,946 non-null**
-   Unique narratives: **74,285**
-   Duplicate narrative occurrences: **7,661**
-   Companies: **1,995**
-   Products: **11**
-   Issues: **86**
-   States: **58**

## Project 1 --- Product Classification

### Problem

Classify the primary CFPB `Product` from information available at
complaint intake.

### Prediction event

``` text
Complaint received
       ↓
Intake-time information
       ↓
Predict Product
```

### Features

-   Consumer complaint narrative
-   Company

### Feature engineering

-   Word TF-IDF: n-grams `(1,2)`, maximum 10,000 features
-   Character TF-IDF: n-grams `(3,5)`, maximum 10,000 features
-   Company OneHotEncoder with `handle_unknown="ignore"`

### Model

Logistic Regression

-   `C=1.0`
-   `class_weight=None`
-   `max_iter=1000`

### Leakage exclusions

-   Sub-product
-   Issue
-   Sub-issue
-   Company public response
-   Date sent to company
-   Company response to consumer
-   Timely response?
-   Complaint ID
-   Submitted via

### Duplicate handling

-   Duplicate narrative groups: **1,306**
-   Duplicate occurrences: **7,661**
-   Conflicting exact-narrative groups: **24**
-   Rows affected by conflicting groups: **154**

Group-aware splitting was used to reduce duplicate leakage. Conflicting
groups were quarantined from the primary benchmark.

### Split

-   Train: **58,422**
-   Validation: **11,685**
-   Test: **11,685**

### Final test performance

  Metric              Result
  ------------- ------------
  Accuracy        **86.51%**
  Macro F1        **79.30%**
  Weighted F1     **86.32%**

### Artifact

`Reports/project1/Models_package/project1_product_classifier.joblib`

Version: `1.0.0`

SHA-256:

`65d14a79d19e6fc2acdbd0763de4a7a1f4fc0d09ed29ec33b9fb3dd23f04d592`

### Limitation

Company identity is highly informative for Product classification.
Robustness on previously unseen companies therefore remains an important
consideration.

## Project 2 --- Triage Latency Prediction

### Problem

Predict the number of days between `Date received` and
`Date sent to company` using information available at intake.

### Target

`triage_delay_days`

### Model

Ridge Regression with a `log1p` target transformation and `expm1`
inverse transformation.

Features:

-   Consumer complaint narrative
-   Company
-   Hour
-   Day of week
-   Day of month
-   Month
-   Weekend indicator

### Temporal split

  Split            Rows Period
  ------------ -------- -------------------------
  Train          57,362 2026-03-01 → 2026-05-27
  Validation     12,291 2026-05-27 → 2026-06-17
  Test           12,293 2026-06-17 → 2026-08-11

### Frozen test performance

  Metric                 Ridge
  ---------- -----------------
  MAE          **0.4512 days**
  MedianAE     **0.1054 days**
  RMSE         **1.6663 days**
  R²               **-0.2757**

### Baseline

Train+validation median baseline:

  Metric              Baseline
  ---------- -----------------
  MAE          **0.1764 days**
  MedianAE     **0.0056 days**
  RMSE         **1.4853 days**
  R²               **-0.0136**

The Ridge model did not outperform the baseline.

### Deployment status

``` text
EXPERIMENTAL_NOT_PRODUCTION_APPROVED
Baseline evaluation: MANDATORY
Autonomous decisioning: PROHIBITED
```

This is an intentional evidence-based deployment gate.

### Artifact

`Reports/project2/Models_package/project2_triage_latency_predictor.joblib`

Version: `1.0.0`

SHA-256:

`24ce1c264c4f6ca28dc760321ebae8041d4a2e1c2972b8f48129675b001c0256`

## Architecture

``` text
Next.js / Vercel
       │ HTTPS / JSON
       ▼
FastAPI / Render
       │
       ├── Project 1 Service → Product Classifier
       │
       └── Project 2 Service → Triage Predictor
                    │
                    ▼
             Frozen ML Artifacts
```

Backend responsibilities include request validation, feature
transformation, inference, health/readiness checks, model metadata,
structured logging, request IDs, error handling, and CORS configuration.

## API

  Method   Endpoint                             Purpose
  -------- ------------------------------------ --------------------------------------
  GET      `/health`                            Liveness
  GET      `/ready`                             Model readiness
  GET      `/models`                            Model metadata and evaluation status
  POST     `/api/v1/project1/product/predict`   Product classification
  POST     `/api/v1/project2/triage/predict`    Triage latency prediction
  POST     `/api/v1/combined/predict`           Unified inference

Swagger:

`https://cfpb-complaint-intelligence-platform.onrender.com/docs`

## Inference Contract

``` text
Request
  ↓
Schema validation
  ↓
Frozen vectorizers / encoders
  ↓
Frozen model
  ↓
Prediction
  ↓
Validated response
```

Preprocessing is not refit during inference.

## Operational Principles

-   Prediction is not automatically a decision.
-   Baselines are required before claiming model value.
-   Post-outcome information is excluded from intake-time prediction.
-   Experimental models are explicitly labelled.
-   Complaint narratives should not be written into normal application
    logs.
-   Autonomous complaint resolution is not performed.

## Repository Structure

``` text
.
├── Data/                         # Local datasets; not committed
├── Notebooks/
├── Reports/
│   ├── project1/
│   │   └── Models_package/
│   └── project2/
│       └── Models_package/
├── Src/
│   ├── api/
│   ├── project1/
│   └── project2/
├── frontend/
├── Dockerfile
├── .dockerignore
├── .env.example
├── .gitignore
├── requirements-backend.txt
└── README.md
```

## Local Backend Setup

``` bash
git clone [REPLACE_WITH_GITHUB_REPOSITORY_URL]
cd CFPB-COMPLAINT-INTELLIGENCE-PLATFORM

python -m venv .venv
```

Windows:

``` bash
.venv\Scripts\activate
```

macOS/Linux:

``` bash
source .venv/bin/activate
```

Install:

``` bash
pip install -r requirements-backend.txt
```

Start:

``` bash
uvicorn Src.api.main:app --reload --port 8000
```

Open:

`http://localhost:8000/docs`

## Docker

Build:

``` bash
docker build -t cfpb-complaint-api:1.0 .
```

Run:

``` bash
docker run --rm -p 8000:8000 cfpb-complaint-api:1.0
```

## Frontend

``` bash
cd frontend
npm install
npm run dev
```

Set:

``` text
NEXT_PUBLIC_API_BASE_URL=[REPLACE_WITH_BACKEND_URL]
```

## Testing Checklist

Replace the placeholder with the actual command used in this repository.

``` bash
[npm run lint,
npm run type-check,
npm run build]
```

Verify:

-   Health/readiness
-   Model loading
-   Project 1 inference
-   Project 2 inference
-   Combined inference
-   Known and unknown company
-   Invalid input
-   Narrative length limits
-   Deterministic inference
-   CORS
-   Frontend/backend connectivity

## Evaluation and Reports

Detailed methodology should remain in `Notebooks/` and `Reports/`,
including:

-   Data understanding
-   Validation and sanity audit
-   EDA
-   Duplicate analysis
-   Missingness
-   Leakage analysis
-   Feature engineering
-   Split strategy
-   Baselines
-   Model selection
-   Evaluation
-   Error analysis
-   Limitations
-   Deployment decisions

## Known Limitations

1.  The dataset represents a specific extraction window.
2.  Product classification can benefit strongly from company identity.
3.  Duplicate and templated narratives exist.
4.  Triage latency is highly skewed with a large near-zero regime and a
    rare long-delay tail.
5.  Project 2 does not outperform the simple baseline and is not
    approved for autonomous decisioning.
6.  The deployed system does not continuously retrain models.
7.  Continuous production drift monitoring is a future improvement.
8.  \[REPLACE_WITH_ADDITIONAL_LIMITATION\]

## Future Improvements

Prioritize improvements based on evidence rather than adding technology
for its own sake.

-   Unseen-company robustness evaluation
-   Classification probability calibration analysis
-   Input/prediction drift monitoring
-   Tail-focused triage modelling
-   Model/version registry
-   Automated CI/CD tests
-   API rate limiting and security hardening
-   Production telemetry
-   Human feedback loop


## Project Status

  Component                          Status
  ---------------------------------- -------------------------
  Raw data analysis                  Completed
  Project 1                          Frozen / verified
  Project 1 deployment               Deployed
  Project 2                          Frozen / experimental
  Project 2 autonomous decisioning   Not approved
  FastAPI backend                    Deployed
  Docker                             Implemented
  Frontend                           Deployed
  Backend ↔ frontend inference       Working
  README                             Updated
  CI/CD                              NA
  Production monitoring              NA

## Author

**\[Gurunagesh\]**

B.Tech Computer Science Engineering\
\[Aditya University\, Kakinada - AP, India]

-   GitHub: \[https://github.com/Gurunagesh/\]
-   LinkedIn: \[https://www.linkedin.com/in/mudamanchu-gurunagesh/\]
-   Portfolio: \[REPLACE\]
-   Email: \[mudamochuguru@gmail.com\]


