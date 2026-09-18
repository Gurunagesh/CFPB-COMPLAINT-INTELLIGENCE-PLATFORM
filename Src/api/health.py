from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "CFPB Complaint Intelligence API",
    }


@router.get("/ready")
def readiness(request: Request):
    models = getattr(request.app.state, "models", None)

    if not models:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "reason": "models_not_loaded",
            },
        )

    project1_ready = models.get("project1") is not None
    project2_ready = models.get("project2") is not None

    ready = project1_ready and project2_ready

    if not ready:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "models": {
                    "project1": project1_ready,
                    "project2": project2_ready,
                },
            },
        )

    return {
        "status": "ready",
        "models": {
            "project1": True,
            "project2": True,
        },
    }