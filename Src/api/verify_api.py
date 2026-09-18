import requests


BASE_URL = "http://127.0.0.1:8000"


def check(response, name):
    print(f"{name:<45}", end="")

    if response.status_code == 200:
        print("PASS")
    else:
        print(
            f"FAIL ({response.status_code})"
        )
        print(response.text)
        raise SystemExit(1)


print("=" * 70)
print("CFPB COMPLAINT INTELLIGENCE API — CONTRACT TEST")
print("=" * 70)


# ------------------------------------------------------------
# HEALTH
# ------------------------------------------------------------

response = requests.get(
    f"{BASE_URL}/health"
)

check(response, "GET /health")


# ------------------------------------------------------------
# MODELS
# ------------------------------------------------------------

response = requests.get(
    f"{BASE_URL}/models"
)

check(response, "GET /models")


# ------------------------------------------------------------
# PROJECT 1
# ------------------------------------------------------------

project1_payload = {
    "narrative": (
        "I noticed a credit card charge that I do not "
        "recognize and I need help disputing this transaction."
    ),
    "company": "Capital One"
}

response = requests.post(
    f"{BASE_URL}/api/v1/project1/product/predict",
    json=project1_payload
)

check(
    response,
    "POST Project 1 product prediction"
)

project1_result = response.json()

assert (
    project1_result["model_status"]
    == "verified"
)

assert project1_result["confidence"] >= 0
assert project1_result["confidence"] <= 1

assert len(
    project1_result["top_predictions"]
) == 3

print(
    "  Project 1 response validation".ljust(45),
    "PASS"
)


# ------------------------------------------------------------
# PROJECT 2
# ------------------------------------------------------------

project2_payload = {
    "narrative": (
        "I submitted a complaint about a problem with "
        "my bank account and I am waiting for the company "
        "to respond."
    ),
    "company": "Capital One",
    "date_received": "2026-06-20T10:30:00Z"
}

response = requests.post(
    f"{BASE_URL}/api/v1/project2/triage/predict",
    json=project2_payload
)

check(
    response,
    "POST Project 2 triage prediction"
)

project2_result = response.json()

assert (
    project2_result["model_status"]
    == "experimental_not_production_approved"
)

assert project2_result[
    "predicted_delay_days"
] >= 0

assert project2_result[
    "predicted_delay_hours"
] >= 0

print(
    "  Project 2 response validation".ljust(45),
    "PASS"
)


# ------------------------------------------------------------
# UNKNOWN COMPANY
# ------------------------------------------------------------

unknown_company_payload = {
    "narrative": (
        "I am having an issue with a financial product "
        "and need assistance resolving my complaint."
    ),
    "company": (
        "Company Never Seen During Training XYZ"
    )
}

response = requests.post(
    f"{BASE_URL}/api/v1/project1/product/predict",
    json=unknown_company_payload
)

check(
    response,
    "Project 1 unknown-company inference"
)


# ------------------------------------------------------------
# COMBINED
# ------------------------------------------------------------

combined_payload = {
    "narrative": (
        "I noticed a credit card charge that I do not "
        "recognize and I need help disputing this transaction."
    ),
    "company": "Capital One",
    "date_received": "2026-06-20T10:30:00Z"
}

response = requests.post(
    f"{BASE_URL}/api/v1/combined/predict",
    json=combined_payload
)

check(
    response,
    "POST combined prediction"
)

combined_result = response.json()

assert "product_prediction" in combined_result
assert "triage_prediction" in combined_result

print(
    "  Combined response validation".ljust(45),
    "PASS"
)


# ------------------------------------------------------------
# INVALID REQUEST
# ------------------------------------------------------------

response = requests.post(
    f"{BASE_URL}/api/v1/project1/product/predict",
    json={
        "company": "Capital One"
    }
)

print(
    "Invalid Project 1 request".ljust(45),
    end=""
)

if response.status_code == 422:
    print("PASS")
else:
    print(
        f"FAIL ({response.status_code})"
    )
    raise SystemExit(1)


# ------------------------------------------------------------
# FINAL
# ------------------------------------------------------------

print("=" * 70)
print("API CONTRACT VERIFICATION COMPLETE")
print("=" * 70)
print("STATUS: PASS")
print()
print("Backend is ready for:")
print("    STEP 4 — Streamlit frontend")
print("=" * 70)