from pydantic import BaseModel, Field
from pydantic import BaseModel, Field

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Query,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from datetime import timedelta
from typing import List

from pathlib import Path
from functools import lru_cache

import os
import math
import numbers
import re

import pandas as pd
import requests

from . import database, models, schemas, auth, predict, mandi, disease_prediction, whatsapp_router


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Smart Kisan API",
    description="AI-powered crop recommendation backend",
    version="1.0.0",
    docs_url="/API/docs",
    redoc_url="/API/redoc",
    openapi_url="/API/openapi.json",
)


# ============================================================
app.include_router(whatsapp_router.router)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

models.Base.metadata.create_all(bind=database.engine)


# ============================================================
# HEALTH
# ============================================================

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "running",
        "app": "Smart Kisan API",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok"
    }


# ============================================================
# AUTHENTICATION
# ============================================================

@app.post(
    "/API/register",
    response_model=schemas.UserOut,
    tags=["Auth"],
)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(database.get_db),
):
    existing = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=auth.hash_password(user.password),
        state=user.state,
        district=user.district,
        phone=user.phone,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post(
    "/API/login",
    response_model=schemas.Token,
    tags=["Auth"],
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == form_data.username)
        .first()
    )

    if not user or not auth.verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = auth.create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=7),
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# ============================================================
# USER
# ============================================================

@app.get(
    "/API/me",
    response_model=schemas.UserOut,
    tags=["User"],
)
def get_me(
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    return current_user


@app.put(
    "/API/me",
    response_model=schemas.UserOut,
    tags=["User"],
)
def update_me(
    updates: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    for field, value in updates.dict(
        exclude_unset=True
    ).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


# ============================================================
# CROP PREDICTION
# ============================================================

@app.post(
    "/API/predict",
    response_model=schemas.PredictionOut,
    tags=["Prediction"],
)
def crop_predict(
    data: schemas.PredictionInput,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    result = predict.run_prediction(data)

    record = models.Prediction(
        user_id=current_user.id,
        state=data.state,
        district=data.district,
        soil_type=data.soil_type,
        ph=data.ph,
        nitrogen=data.nitrogen,
        phosphorus=data.phosphorus,
        potassium=data.potassium,
        rainfall=data.rainfall,
        temperature=data.temperature,
        humidity=data.humidity,
        top_crop=result["top_crop"],
        confidence=result["confidence"],
        top3=str(result["top3"]),
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        **result,
        "id": record.id,
        "created_at": record.created_at,
    }


@app.post(
    "/API/predict/guest",
    response_model=schemas.PredictionOut,
    tags=["Prediction"],
)
def crop_predict_guest(
    data: schemas.PredictionInput,
):
    result = predict.run_prediction(data)

    return {
        **result,
        "id": None,
        "created_at": None,
    }


# ============================================================
# HISTORY
# ============================================================

@app.get(
    "/API/history",
    response_model=List[schemas.PredictionRecord],
    tags=["History"],
)
def get_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
    limit: int = 20,
):
    return (
        db.query(models.Prediction)
        .filter(
            models.Prediction.user_id
            == current_user.id
        )
        .order_by(
            models.Prediction.created_at.desc()
        )
        .limit(limit)
        .all()
    )


@app.delete(
    "/API/history/{prediction_id}",
    tags=["History"],
)
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    record = (
        db.query(models.Prediction)
        .filter(
            models.Prediction.id == prediction_id,
            models.Prediction.user_id
            == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found",
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Deleted successfully"
    }


# ============================================================
# FARM
# ============================================================

@app.post(
    "/API/farm",
    response_model=schemas.FarmOut,
    tags=["Farm"],
)
def create_farm(
    farm: schemas.FarmCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    existing = (
        db.query(models.Farm)
        .filter(
            models.Farm.user_id
            == current_user.id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=(
                "Farm profile already exists. "
                "Use PUT to update."
            ),
        )

    new_farm = models.Farm(
        user_id=current_user.id,
        **farm.dict(),
    )

    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)

    return new_farm


@app.get(
    "/API/farm",
    response_model=schemas.FarmOut,
    tags=["Farm"],
)
def get_farm(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    farm = (
        db.query(models.Farm)
        .filter(
            models.Farm.user_id
            == current_user.id
        )
        .first()
    )

    if not farm:
        raise HTTPException(
            status_code=404,
            detail="No farm profile found",
        )

    return farm


@app.put(
    "/API/farm",
    response_model=schemas.FarmOut,
    tags=["Farm"],
)
def update_farm(
    updates: schemas.FarmCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    farm = (
        db.query(models.Farm)
        .filter(
            models.Farm.user_id
            == current_user.id
        )
        .first()
    )

    if not farm:
        raise HTTPException(
            status_code=404,
            detail=(
                "No farm profile found. "
                "Use POST to create."
            ),
        )

    for field, value in updates.dict(
        exclude_unset=True
    ).items():
        setattr(farm, field, value)

    db.commit()
    db.refresh(farm)

    return farm


# ============================================================
# STATISTICS
# ============================================================

@app.get(
    "/API/stats",
    tags=["Stats"],
)
def get_stats(
    db: Session = Depends(database.get_db),
):
    return {
        "total_users": db.query(
            models.User
        ).count(),

        "total_predictions": db.query(
            models.Prediction
        ).count(),

        "model_accuracy": 0.9353,

        "model_version": (
            "V1 - Random Forest"
        ),
    }


# ============================================================
# MANDI PRICES
# ============================================================

@app.get(
    "/API/mandi-prices",
    tags=["Mandi Prices"],
)
def get_mandi_prices():
    return mandi.get_mandi_data()


# ============================================================
# CROP DISEASE DETECTION
# ============================================================

@app.post(
    "/API/disease/analyze",
    tags=["Crop Disease"],
)
async def analyze_disease(
    file: UploadFile = File(...),
):
    if (
        not file.content_type
        or not file.content_type.startswith("image/")
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Please upload a valid "
                "crop/plant image."
            ),
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )

    try:
        return disease_prediction.analyze_crop_disease(
            image_bytes=image_bytes,
            mime_type=file.content_type,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# TEHSIL DATA
# ============================================================

TEHSIL_DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "output"
    / "Crop_Normalized.xlsx"
)


@lru_cache(maxsize=1)
def load_tehsil_data():
    if not TEHSIL_DATA_FILE.exists():
        raise FileNotFoundError(
            f"Tehsil dataset not found: {TEHSIL_DATA_FILE}"
        )

    df = pd.read_excel(
        TEHSIL_DATA_FILE
    )

    required = [
        "State_Name",
        "District_Name",
        "Tehsil_Name",
        "Crop",
        "State_Latitude",
        "State_Longitude",
    ]

    missing = [
        column
        for column in required
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "Missing columns: "
            + ", ".join(missing)
        )

    for column in [
        "State_Name",
        "District_Name",
        "Tehsil_Name",
        "Crop",
    ]:
        df[column] = (
            df[column]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    return df


def normalize_text(value):
    """
    Normalizes text received from reverse geocoding.

    Fixes common encoding problems such as:
        MedchalÃ¢Malkajgiri
    """

    if value is None:
        return ""

    value = str(value).strip()

    # Common mojibake correction
    replacements = {
        "Ã¢â‚¬â€œ": "-",
        "Ã¢â‚¬â€": "-",
        "Ã¢â‚¬": "",
        "Ã¢â‚¬â„¢": "'",
        "Ã¢â‚¬Å“": '"',
        "Ã¢â‚¬ï¿½": '"',
        "Ã¢â€žÂ¢": "",
        "Ã‚": "",
    }

    for old, new in replacements.items():
        value = value.replace(old, new)

    value = value.replace("MedchalÃ¢Malkajgiri",
                          "Medchal Malkajgiri")

    value = value.replace("Medchal-Malkajgiri",
                          "Medchal Malkajgiri")

    value = re.sub(
        r"\s+",
        " ",
        value,
    ).strip()

    return value


def casefold_text(value):
    return normalize_text(value).casefold()


def tehsil_json_safe(value):
    if value is None:
        return None

    if isinstance(value, dict):
        return {
            str(k): tehsil_json_safe(v)
            for k, v in value.items()
        }

    if isinstance(value, (list, tuple)):
        return [
            tehsil_json_safe(v)
            for v in value
        ]

    if isinstance(value, numbers.Real):
        number = float(value)

        return (
            number
            if math.isfinite(number)
            else None
        )

    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    return str(value)


# ============================================================
# TEHSIL OPTIONS
# ============================================================

@app.get(
    "/API/tehsil-options",
    tags=["Tehsil Analysis"],
)
def tehsil_options(
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
):
    try:
        df = load_tehsil_data()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

    filtered = df

    if state:
        state_key = casefold_text(state)

        filtered = filtered[
            filtered["State_Name"]
            .map(casefold_text)
            == state_key
        ]

    if district:
        district_key = casefold_text(district)

        filtered = filtered[
            filtered["District_Name"]
            .map(casefold_text)
            == district_key
        ]

    return {
        "states": sorted(
            df["State_Name"]
            .replace("", pd.NA)
            .dropna()
            .unique()
            .tolist()
        ),

        "districts": sorted(
            filtered["District_Name"]
            .replace("", pd.NA)
            .dropna()
            .unique()
            .tolist()
        ),

        "tehsils": sorted(
            filtered["Tehsil_Name"]
            .replace("", pd.NA)
            .dropna()
            .unique()
            .tolist()
        ),
    }


# ============================================================
# TEHSIL ANALYSIS
# ============================================================

@app.get(
    "/API/tehsil-analysis",
    tags=["Tehsil Analysis"],
)
def tehsil_analysis(
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    tehsil: str | None = Query(default=None),
    include_records: bool = Query(default=False),
):
    try:
        df = load_tehsil_data()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

    filtered = df

    if state:
        state_key = casefold_text(state)

        filtered = filtered[
            filtered["State_Name"]
            .map(casefold_text)
            == state_key
        ]

    if district:
        district_key = casefold_text(district)

        filtered = filtered[
            filtered["District_Name"]
            .map(casefold_text)
            == district_key
        ]

    if tehsil:
        tehsil_key = casefold_text(tehsil)

        filtered = filtered[
            filtered["Tehsil_Name"]
            .map(casefold_text)
            == tehsil_key
        ]

    crops = (
        filtered["Crop"]
        .replace("", pd.NA)
        .dropna()
        .value_counts()
        .to_dict()
    )

    response = {
        "stats": {
            "states": int(
                filtered["State_Name"]
                .replace("", pd.NA)
                .nunique()
            ),

            "districts": int(
                filtered["District_Name"]
                .replace("", pd.NA)
                .nunique()
            ),

            "tehsils": int(
                filtered["Tehsil_Name"]
                .replace("", pd.NA)
                .nunique()
            ),

            "crops": int(
                filtered["Crop"]
                .replace("", pd.NA)
                .nunique()
            ),

            "records": int(
                len(filtered)
            ),
        },

        "states": sorted(
            filtered["State_Name"]
            .replace("", pd.NA)
            .dropna()
            .unique()
            .tolist()
        ),

        "districts": sorted(
            filtered["District_Name"]
            .replace("", pd.NA)
            .dropna()
            .unique()
            .tolist()
        ),

        "tehsils": sorted(
            filtered["Tehsil_Name"]
            .replace("", pd.NA)
            .dropna()
            .unique()
            .tolist()
        ),

        "crops": {
            str(key): int(value)
            for key, value in crops.items()
        },
    }

    if include_records:
        columns = [
            "State_Name",
            "District_Name",
            "Tehsil_Name",
            "Crop",
            "State_Latitude",
            "State_Longitude",
        ]

        records = (
            filtered[columns]
            .drop_duplicates()
            .to_dict(orient="records")
        )

        response["records"] = [
            tehsil_json_safe(record)
            for record in records
        ]

    return tehsil_json_safe(response)


# ============================================================
# AUTOMATIC LOCATION DETECTION
# ============================================================

def find_dataset_tehsil(
    df,
    state,
    district,
    detected_tehsil,
    display_name="",
):
    """
    Find the dataset Tehsil from reverse-geocoded location.

    Example:
        Nominatim:
            Greater Hyderabad Municipal Corporation West Zone

        Dataset:
            Kukatpally

    The display_name is also checked because it can contain
    "Kukatpally mandal".
    """

    state_key = casefold_text(state)
    district_key = casefold_text(district)

    # --------------------------------------------------------
    # State filter
    # --------------------------------------------------------

    candidates = df[
        df["State_Name"].map(casefold_text) == state_key
    ]

    if candidates.empty:
        return ""

    # --------------------------------------------------------
    # District filter
    # --------------------------------------------------------

    if district_key:

        district_candidates = candidates[
            candidates["District_Name"]
            .map(casefold_text)
            == district_key
        ]

        # Special handling for Medchal Malkajgiri
        if district_candidates.empty:

            district_candidates = candidates[
                candidates["District_Name"]
                .map(
                    lambda x:
                    (
                        "medchal" in casefold_text(x)
                        and
                        "malkajgiri" in casefold_text(x)
                    )
                )
            ]

        if not district_candidates.empty:
            candidates = district_candidates

    # --------------------------------------------------------
    # Build searchable location text
    # --------------------------------------------------------

    text_blob = " ".join(
        [
            normalize_text(detected_tehsil),
            normalize_text(display_name),
        ]
    ).casefold()

    # --------------------------------------------------------
    # Explicit location mappings
    # --------------------------------------------------------

    location_mappings = {

        # Telangana / Hyderabad
        "kukatpally": "Kukatpally",
        "kukatpally mandal": "Kukatpally",

        "greater hyderabad municipal corporation west zone":
            "Kukatpally",

        "ghmc west zone":
            "Kukatpally",

        "balaji nagar":
            "Kukatpally",

        "kphb":
            "Kukatpally",

        "kphb colony":
            "Kukatpally",

        # Other common areas around Kukatpally
        "ward 115 balaji nagar":
            "Kukatpally",
    }

    # --------------------------------------------------------
    # Check explicit mappings
    # --------------------------------------------------------

    for search_text, dataset_tehsil in location_mappings.items():

        if search_text in text_blob:

            match = candidates[
                candidates["Tehsil_Name"]
                .map(casefold_text)
                == casefold_text(dataset_tehsil)
            ]

            if not match.empty:
                return match.iloc[0]["Tehsil_Name"]

    # --------------------------------------------------------
    # Exact dataset Tehsil match
    # --------------------------------------------------------

    for value in candidates["Tehsil_Name"].unique():

        value_key = casefold_text(value)

        if value_key and value_key in text_blob:
            return value

    # --------------------------------------------------------
    # Reverse check
    # --------------------------------------------------------

    detected_key = casefold_text(
        detected_tehsil
    )

    if detected_key:

        for value in candidates["Tehsil_Name"].unique():

            candidate_key = casefold_text(value)

            if (
                detected_key in candidate_key
                or candidate_key in detected_key
            ):
                return value

    return ""


# ============================================================
# AUTOMATIC LOCATION API
# ============================================================

@app.get(
    "/API/location/detect",
    tags=["Location"],
)
def detect_location(
    latitude: float,
    longitude: float,
):

    # --------------------------------------------------------
    # Validate coordinates
    # --------------------------------------------------------

    if not -90 <= latitude <= 90:
        raise HTTPException(
            status_code=400,
            detail="Invalid latitude.",
        )

    if not -180 <= longitude <= 180:
        raise HTTPException(
            status_code=400,
            detail="Invalid longitude.",
        )

    # --------------------------------------------------------
    # Reverse geocoding using Nominatim
    # --------------------------------------------------------

    try:

        response = requests.get(
            "https://nominatim.openstreetmap.org/reverse",

            params={
                "format": "jsonv2",
                "addressdetails": 1,
                "lat": latitude,
                "lon": longitude,
                "zoom": 18,
            },

            headers={
                "User-Agent":
                    "Smart-Kisan/1.0 "
                    "(agricultural-analysis-app)",
            },

            timeout=15,
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to determine your area "
                "from the coordinates."
            ),
        ) from exc

    # --------------------------------------------------------
    # Reverse-geocoded address
    # --------------------------------------------------------

    address = data.get(
        "address",
        {},
    )

    detected_state = normalize_text(
        address.get("state", "")
    )

    detected_district = normalize_text(
        address.get("state_district")
        or address.get("district")
        or address.get("county")
        or ""
    )

    detected_tehsil = normalize_text(
        address.get("municipality")
        or address.get("city_district")
        or address.get("town")
        or address.get("city")
        or address.get("village")
        or address.get("suburb")
        or ""
    )

    display_name = normalize_text(
        data.get(
            "display_name",
            "",
        )
    )

    # --------------------------------------------------------
    # Dataset-compatible values
    # --------------------------------------------------------

    dataset_state = detected_state
    dataset_district = detected_district
    dataset_tehsil = ""

    try:

        df = load_tehsil_data()

        # ----------------------------------------------------
        # Match State
        # ----------------------------------------------------

        state_matches = df[
            df["State_Name"]
            .map(casefold_text)
            == casefold_text(detected_state)
        ]

        if not state_matches.empty:

            dataset_state = (
                state_matches.iloc[0]["State_Name"]
            )

        # ----------------------------------------------------
        # Match District
        # ----------------------------------------------------

        if not state_matches.empty:

            district_key = casefold_text(
                detected_district
            )

            for district_value in (
                state_matches["District_Name"]
                .dropna()
                .unique()
            ):

                dataset_district_key = (
                    casefold_text(district_value)
                )

                # Exact match
                if (
                    dataset_district_key
                    == district_key
                ):

                    dataset_district = (
                        district_value
                    )

                    break

                # Medchal Malkajgiri
                if (
                    "medchal" in district_key
                    and
                    "malkajgiri" in district_key
                    and
                    "medchal" in dataset_district_key
                    and
                    "malkajgiri"
                    in dataset_district_key
                ):

                    dataset_district = (
                        district_value
                    )

                    break

        # ----------------------------------------------------
        # Explicit fallback for Telangana
        # ----------------------------------------------------

        if (
            casefold_text(dataset_state)
            == "telangana"
        ):

            if (
                "medchal" in
                casefold_text(
                    detected_district
                )
                and
                "malkajgiri" in
                casefold_text(
                    detected_district
                )
            ):

                dataset_district = (
                    "Medchal Malkajgiri"
                )

        # ----------------------------------------------------
        # Find Tehsil
        # ----------------------------------------------------

        dataset_tehsil = find_dataset_tehsil(
            df=df,
            state=dataset_state,
            district=dataset_district,
            detected_tehsil=detected_tehsil,
            display_name=display_name,
        )

    except Exception as exc:

        # Do not fail location detection if
        # dataset processing has an issue.

        print(
            "Tehsil dataset matching error:",
            exc,
        )

    # --------------------------------------------------------
    # Final safety mapping
    # --------------------------------------------------------

    search_blob = " ".join(
        [
            casefold_text(detected_tehsil),
            casefold_text(display_name),
        ]
    )

    if (
        casefold_text(dataset_state)
        == "telangana"
        and
        casefold_text(dataset_district)
        == "medchal malkajgiri"
    ):

        if (
            "kukatpally" in search_blob
            or
            "kphb" in search_blob
            or
            "balaji nagar" in search_blob
            or
            "greater hyderabad municipal corporation west zone"
            in search_blob
        ):

            dataset_tehsil = "Kukatpally"

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {
        "latitude": latitude,
        "longitude": longitude,

        "state": detected_state,
        "district": detected_district,
        "tehsil": detected_tehsil,

        "detected_state": dataset_state,
        "detected_district": dataset_district,
        "detected_tehsil": dataset_tehsil,

        "display_name": display_name,
    }
# ============================================================
# CROP PROFIT ESTIMATOR
# ============================================================

class ProfitEstimateRequest(BaseModel):
    crop: str = "Maize"
    acres: float = Field(..., gt=0)
    yield_per_acre: float = Field(..., gt=0)
    mandi_price: float = Field(..., gt=0)
    seed_cost: float = Field(default=0, ge=0)
    fertilizer_cost: float = Field(default=0, ge=0)
    labour_cost: float = Field(default=0, ge=0)
    other_cost: float = Field(default=0, ge=0)


@app.post("/API/profit-estimate", tags=["Profit Estimator"])
def profit_estimate(data: ProfitEstimateRequest):

    total_production = data.acres * data.yield_per_acre

    revenue = total_production * data.mandi_price

    total_cost = (
        data.seed_cost
        + data.fertilizer_cost
        + data.labour_cost
        + data.other_cost
    )

    profit = revenue - total_cost

    return {
        "crop": data.crop,
        "acres": data.acres,
        "yield_per_acre": data.yield_per_acre,
        "total_production": round(total_production, 2),
        "mandi_price": round(data.mandi_price, 2),
        "revenue": round(revenue, 2),
        "seed_cost": round(data.seed_cost, 2),
        "fertilizer_cost": round(data.fertilizer_cost, 2),
        "labour_cost": round(data.labour_cost, 2),
        "other_cost": round(data.other_cost, 2),
        "total_cost": round(total_cost, 2),
        "profit": round(profit, 2),
        "profit_per_acre": round(profit / data.acres, 2),
        "cost_per_acre": round(total_cost / data.acres, 2),
        "status": "profit" if profit >= 0 else "loss",
    }
