from datetime import datetime
from typing import List

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


# ============================================================
# PROJECT 1
# ============================================================

class ProductPredictionRequest(BaseModel):

    narrative: str = Field(
        ...,
        min_length=10,
        max_length=20_000,
        description="Consumer complaint narrative"
    )

    company: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Company associated with the complaint"
    )

    @field_validator("narrative", "company")
    @classmethod
    def clean_text(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty or whitespace."
            )

        return value


class ProductProbability(BaseModel):

    product: str

    probability: float = Field(
        ...,
        ge=0.0,
        le=1.0
    )


class ProductPredictionResponse(BaseModel):

    project: str

    model_status: str

    predicted_product: str

    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0
    )

    top_predictions: List[
        ProductProbability
    ]


# ============================================================
# PROJECT 2
# ============================================================

class TriagePredictionRequest(BaseModel):

    narrative: str = Field(
        ...,
        min_length=10,
        max_length=20_000,
        description="Consumer complaint narrative"
    )

    company: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Company associated with the complaint"
    )

    date_received: datetime = Field(
        ...,
        description="Complaint intake timestamp"
    )

    @field_validator("narrative", "company")
    @classmethod
    def clean_text(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty or whitespace."
            )

        return value


# ============================================================
# PROJECT 2 RESPONSE
# ============================================================

class TriagePredictionResponse(BaseModel):

    project: str

    model_status: str

    predicted_delay_days: float = Field(
        ...,
        ge=0.0
    )

    predicted_delay_hours: float = Field(
        ...,
        ge=0.0
    )

    operational_band: str


# ============================================================
# COMBINED
# ============================================================

class CombinedPredictionRequest(BaseModel):

    narrative: str = Field(
        ...,
        min_length=10,
        max_length=20_000
    )

    company: str = Field(
        ...,
        min_length=2,
        max_length=500
    )

    date_received: datetime

    @field_validator("narrative", "company")
    @classmethod
    def clean_text(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty or whitespace."
            )

        return value


class CombinedPredictionResponse(BaseModel):

    product_prediction: ProductPredictionResponse

    triage_prediction: TriagePredictionResponse