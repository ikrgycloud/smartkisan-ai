from fastapi.responses import PlainTextResponse
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from pydantic import BaseModel, field_validator
from typing import Optional

from . import database, models, auth
from .whatsapp_service import (
    send_to_multiple_numbers,
    notify_crop_recommendation,
    notify_mandi_price_alert,
    notify_weather_alert,
    notify_disease_alert,
    notify_profit_alert,
    notify_tehsil_alert,
)

router = APIRouter(prefix="/API/notify", tags=["WhatsApp"])


class CropAlertRequest(BaseModel):
    phone: Optional[str] = None
    farmer_name: str
    top_crop: str
    confidence: float
    top3: list[dict]
    advice: Optional[str] = None


class MandiAlertRequest(BaseModel):
    phone: Optional[str] = None
    farmer_name: str
    crop: str
    mandi_name: str
    price: float
    msp: Optional[float] = None
    state: Optional[str] = None


class TehsilAlertRequest(BaseModel):
    phone: Optional[str] = None
    state: str
    district: str
    tehsil: str
    top_crop: str
    crop_count: int


class ProfitAlertRequest(BaseModel):
    phone: Optional[str] = None
    farmer_name: str
    crop: str
    acres: float
    total_yield: float
    revenue: float
    total_cost: float
    profit: float
    profit_per_acre: float

class DiseaseAlertRequest(BaseModel):
    phone: Optional[str] = None
    farmer_name: str
    crop: str
    status: str
    disease: str
    confidence: float
    treatment: Optional[list[str]] = None
    prevention: Optional[list[str]] = None



class WhatsAppRecipientRequest(BaseModel):
    name: Optional[str] = None
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        digits = value.replace("+91", "").replace(" ", "").replace("-", "")
        if not digits.isdigit() or len(digits) != 10:
            raise ValueError("WhatsApp number must contain exactly 10 digits.")
        return digits

class WeatherAlertRequest(BaseModel):
    phone: Optional[str] = None
    farmer_name: str
    city: str
    temperature: float
    humidity: float
    rainfall_mm: float
    wind_kmh: float
    advisory: Optional[str] = None




def get_user_phones(current_user, db, requested_phone=None):
    phones = []

    if getattr(current_user, "phone", None):
        phones.append(current_user.phone)

    recipients = db.query(models.WhatsAppRecipient).filter(
        models.WhatsAppRecipient.user_id == current_user.id,
        models.WhatsAppRecipient.active == 1
    ).all()

    for recipient in recipients:
        if recipient.phone:
            phones.append(recipient.phone)

    if requested_phone:
        phones.append(requested_phone)

    return list(dict.fromkeys(phones))
def get_user_phone(requested_phone, current_user):
    phone = current_user.phone or requested_phone

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="No phone number is registered for this account.",
        )

    return phone


@router.post("/crop")
def send_crop_notification(
    req: CropAlertRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db=Depends(database.get_db),
):
    try:
        phones = get_user_phones(current_user, db, req.phone)

        if not phones:
            raise HTTPException(status_code=400, detail="No active WhatsApp recipients found for this account.")

        result = send_to_multiple_numbers(
            phones,
            lambda phone: notify_crop_recommendation(
                phone, current_user.name, req.top_crop, req.confidence, req.top3, req.advice
            )
        )

        if any(isinstance(item, dict) and item.get("error") for item in result):
            raise HTTPException(
                status_code=502,
                detail={"message": "WhatsApp notification failed for one or more recipients.", "meta_response": result},
            )

        return {"status": "sent", "meta_response": result}

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to send WhatsApp notification.",
        )


@router.post("/mandi")
def send_mandi_notification(
    req: MandiAlertRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db=Depends(database.get_db),
):
    try:
        phones = get_user_phones(current_user, db, req.phone)

        if not phones:
            raise HTTPException(status_code=400, detail="No active WhatsApp recipients found for this account.")

        result = send_to_multiple_numbers(
            phones,
            lambda phone: notify_mandi_price_alert(
                phone, current_user.name, req.crop, req.mandi_name, req.price, req.msp, req.state
            )
        )

        if any(isinstance(item, dict) and item.get("error") for item in result):
            raise HTTPException(
                status_code=502,
                detail={"message": "WhatsApp notification failed for one or more recipients.", "meta_response": result},
            )

        return {"status": "sent", "meta_response": result}

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to send WhatsApp notification.",
        )


@router.post("/weather")
def send_weather_notification(
    req: WeatherAlertRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db=Depends(database.get_db),
):
    try:
        phones = get_user_phones(current_user, db, req.phone)

        if not phones:
            raise HTTPException(status_code=400, detail="No active WhatsApp recipients found for this account.")

        result = send_to_multiple_numbers(
            phones,
            lambda phone: notify_weather_alert(
                phone, current_user.name, req.city, req.temperature, req.humidity, req.rainfall_mm, req.wind_kmh, req.advisory
            )
        )

        if any(isinstance(item, dict) and item.get("error") for item in result):
            raise HTTPException(
                status_code=502,
                detail={"message": "WhatsApp notification failed for one or more recipients.", "meta_response": result},
            )

        return {"status": "sent", "meta_response": result}

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to send WhatsApp notification.",
        )



@router.post("/disease")
def send_disease_alert(
    req: DiseaseAlertRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db=Depends(database.get_db),
):
    try:
        phones = get_user_phones(current_user, db, req.phone)

        if not phones:
            raise HTTPException(
                status_code=400,
                detail="No active WhatsApp recipients found for this account."
            )

        result = send_to_multiple_numbers(
            phones,
            lambda phone: notify_disease_alert(
                phone=phone,
                farmer_name=current_user.name,
                crop=req.crop,
                status=req.status,
                disease=req.disease,
                confidence=req.confidence,
                treatment=req.treatment,
                prevention=req.prevention,
            )
        )

        if any(isinstance(item, dict) and item.get("error") for item in result):
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "WhatsApp notification failed for one or more recipients.",
                    "meta_response": result,
                },
            )

        return {"status": "sent", "meta_response": result}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/profit')

def send_profit_alert(
    req: ProfitAlertRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db=Depends(database.get_db),
):
    try:
        phones = get_user_phones(current_user, db, req.phone)

        if not phones:
            raise HTTPException(status_code=400, detail="No active WhatsApp recipients found for this account.")

        result = send_to_multiple_numbers(
            phones,
            lambda phone: notify_profit_alert(
                phone=phone,
                farmer_name=current_user.name,
                crop=req.crop,
                acres=req.acres,
                total_yield=req.total_yield,
                revenue=req.revenue,
                total_cost=req.total_cost,
                profit=req.profit,
                profit_per_acre=req.profit_per_acre,
            )
        )

        if any(isinstance(item, dict) and item.get("error") for item in result):
            raise HTTPException(
                status_code=502,
                detail={"message": "WhatsApp notification failed for one or more recipients.", "meta_response": result},
            )

        return {"status": "sent", "meta_response": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
@router.post("/tehsil")
def send_tehsil_alert(
    req: TehsilAlertRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db=Depends(database.get_db),
):
    try:
        phones = get_user_phones(current_user, db, req.phone)

        if not phones:
            raise HTTPException(
                status_code=400,
                detail="No active WhatsApp recipients found for this account."
            )

        result = send_to_multiple_numbers(
            phones,
            lambda phone: notify_tehsil_alert(
                phone=phone,
                farmer_name=current_user.name,
                state=req.state,
                district=req.district,
                tehsil=req.tehsil,
                top_crop=req.top_crop,
                crop_count=req.crop_count,
            )
        )

        if any(isinstance(item, dict) and item.get("error") for item in result):
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "WhatsApp notification failed for one or more recipients.",
                    "meta_response": result,
                },
            )

        return {"status": "sent", "meta_response": result}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/recipients')
def add_whatsapp_recipient(req: WhatsAppRecipientRequest, current_user: models.User = Depends(auth.get_current_user), db=Depends(database.get_db)):
    existing = db.query(models.WhatsAppRecipient).filter(models.WhatsAppRecipient.user_id == current_user.id, models.WhatsAppRecipient.phone == req.phone).first()
    if existing:
        existing.active = 1
        existing.name = req.name
    else:
        db.add(models.WhatsAppRecipient(user_id=current_user.id, name=req.name, phone=req.phone, active=1))
    db.commit()
    return {'status': 'saved', 'message': 'WhatsApp number added successfully.'}


@router.get('/recipients')
def list_whatsapp_recipients(current_user: models.User = Depends(auth.get_current_user), db=Depends(database.get_db)):
    recipients = db.query(models.WhatsAppRecipient).filter(models.WhatsAppRecipient.user_id == current_user.id, models.WhatsAppRecipient.active == 1).all()
    return [{'id': r.id, 'name': r.name, 'phone': r.phone} for r in recipients]


@router.delete('/recipients/{recipient_id}')
def delete_whatsapp_recipient(recipient_id: int, current_user: models.User = Depends(auth.get_current_user), db=Depends(database.get_db)):
    recipient = db.query(models.WhatsAppRecipient).filter(models.WhatsAppRecipient.id == recipient_id, models.WhatsAppRecipient.user_id == current_user.id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail='WhatsApp number not found.')
    recipient.active = 0
    db.commit()
    return {'status': 'deleted', 'message': 'WhatsApp number removed successfully.'}


@router.get("/webhook")
def whatsapp_webhook_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", "")
    if hub_mode == "subscribe" and hub_verify_token == verify_token:
        return PlainTextResponse(hub_challenge or "")
    raise HTTPException(status_code=403, detail="Webhook verification failed")


@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    payload = await request.json()
    print("WHATSAPP WEBHOOK:", payload)
    return {"status": "received"}
