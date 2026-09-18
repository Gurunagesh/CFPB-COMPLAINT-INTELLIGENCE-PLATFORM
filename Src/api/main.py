from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .exceptions import (
    PredictionServiceError,
    generic_exception_handler,
    prediction_service_error_handler,
)
from .health import router as health_router
from .logging_config import configure_logging
from .middleware import request_logging_middleware
from .model_loader import load_all_models
from .project1_service import predict_product
from .project2_service import predict_triage
from .schemas import (
    CombinedPredictionRequest,
    CombinedPredictionResponse,
    ProductPredictionRequest,
    ProductPredictionResponse,
    TriagePredictionRequest,
    TriagePredictionResponse,
)


# ============================================================
# LOGGING
# ============================================================

configure_logging(settings.log_level)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title=settings.app_name,
    description=(
        "FastAPI backend for the "
        "CFPB Consumer Complaint Intelligence System."
    ),
    version=settings.app_version,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST LOGGING
# ============================================================

app.middleware("http")(
    request_logging_middleware
)


# ============================================================
# EXCEPTION HANDLERS
# ============================================================

app.add_exception_handler(
    PredictionServiceError,
    prediction_service_error_handler,
)

app.add_exception_handler(
    Exception,
    generic_exception_handler,
)


# ============================================================
# MODEL LOADING
# ============================================================

MODELS = load_all_models()

app.state.models = MODELS


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    health_router
)


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/models")
def models():
    project1_metadata = MODELS["project1"]["metadata"]
    project2_metadata = MODELS["project2"]["metadata"]

    project1_performance = project1_metadata.get(
        "final_test_performance",
        {}
    )

    project2_evaluation = project2_metadata.get(
        "evaluation_metadata",
        {}
    )

    project2_frozen_test = project2_evaluation.get(
        "frozen_test",
        {}
    )

    project2_baseline = project2_evaluation.get(
        "test_baseline",
        {}
    )

    project2_deployment = project2_metadata.get(
        "deployment",
        {}
    )

    return {
        "project1": {
            "name": "CFPB Product Classification",
            "artifact_name": project1_metadata.get(
                "artifact_name"
            ),
            "version": project1_metadata.get(
                "artifact_version"
            ),
            "task": project1_metadata.get(
                "task"
            ),
            "target": project1_metadata.get(
                "target"
            ),
            "model_type": project1_metadata.get(
                "model_configuration",
                {}
            ).get("algorithm"),
            "status": "verified",
            "test_metrics": project1_performance,
            "metadata_loaded": project1_metadata is not None,
        },

        "project2": {
            "name": "CFPB Triage Latency Prediction",
            "artifact_name": project2_metadata.get(
                "artifact_name"
            ),
            "version": project2_metadata.get(
                "model_configuration",
                {}
            ).get("version"),
            "task": project2_metadata.get(
                "task"
            ),
            "target": project2_metadata.get(
                "target"
            ),
            "model_type": project2_metadata.get(
                "model_configuration",
                {}
            ).get("algorithm"),
            "status": project2_deployment.get(
                "status",
                "unknown"
            ),
            "test_metrics": project2_frozen_test,
            "baseline_metrics": project2_baseline,
            "baseline_required": project2_deployment.get(
                "baseline_required",
                True
            ),
            "autonomous_decision_allowed": project2_deployment.get(
                "autonomous_decision_allowed",
                False
            ),
            "metadata_loaded": project2_metadata is not None,
        },
    }

# ============================================================
# PROJECT 1
# ============================================================

@app.post(
    "/api/v1/project1/product/predict",
    response_model=ProductPredictionResponse,
)
def predict_product_endpoint(
    request: ProductPredictionRequest
):

    return predict_product(
        MODELS["project1"],
        request.narrative,
        request.company,
    )


# ============================================================
# PROJECT 2
# ============================================================

@app.post(
    "/api/v1/project2/triage/predict",
    response_model=TriagePredictionResponse,
)
def predict_triage_endpoint(
    request: TriagePredictionRequest
):

    return predict_triage(
        MODELS["project2"],
        request.narrative,
        request.company,
        request.date_received,
    )


# ============================================================
# COMBINED
# ============================================================

@app.post(
    "/api/v1/combined/predict",
    response_model=CombinedPredictionResponse,
)
def combined_prediction(
    request: CombinedPredictionRequest
):

    product_result = predict_product(
        MODELS["project1"],
        request.narrative,
        request.company,
    )

    triage_result = predict_triage(
        MODELS["project2"],
        request.narrative,
        request.company,
        request.date_received,
    )

    return {
        "product_prediction": product_result,
        "triage_prediction": triage_result,
    }