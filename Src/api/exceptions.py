from fastapi import Request
from fastapi.responses import JSONResponse


class PredictionServiceError(Exception):
    """Expected prediction-service failure."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


async def prediction_service_error_handler(
    request: Request,
    exc: PredictionServiceError
):
    return JSONResponse(
        status_code=503,
        content={
            "error": "prediction_service_unavailable",
            "message": exc.message,
        },
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception
):
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected server error occurred.",
        },
    )