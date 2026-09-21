import io

import torch
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageClassification


MODEL_NAME = "mesabo/agri-plant-disease-resnet50"

print("Loading local crop disease model...")

model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
model.eval()

# Standard ImageNet preprocessing used by ResNet-style models.
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

print("Local crop disease model loaded.")


def analyze_crop_disease(image_bytes: bytes, mime_type: str = "image/jpeg"):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {
            "crop": "Unknown",
            "status": "Uncertain",
            "disease": "Invalid image",
            "confidence": 0,
            "symptoms": [],
            "treatment": [],
            "prevention": [],
            "notes": "The uploaded file could not be read as an image.",
        }

    image_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(pixel_values=image_tensor)
        probabilities = torch.softmax(outputs.logits, dim=-1)

    predicted_index = probabilities.argmax(dim=-1).item()
    confidence = probabilities[0, predicted_index].item()

    label = model.config.id2label.get(
        predicted_index,
        f"class_{predicted_index}"
    )

    if "___" in label:
        crop, disease = label.split("___", 1)
    else:
        crop = "Unknown"
        disease = label

    crop = crop.replace("_", " ").strip()
    disease = disease.replace("_", " ").strip()

    if disease.lower() == "healthy":
        status = "Healthy"
        disease_name = "Healthy"
    else:
        status = "Diseased"
        disease_name = disease

    return {
        "crop": crop,
        "status": status,
        "disease": disease_name,
        "confidence": round(confidence * 100, 2),
        "symptoms": [],
        "treatment": [],
        "prevention": [],
        "notes": (
            "Preliminary local ML classification using a PlantVillage "
            "image-classification model. The result is not a laboratory "
            "diagnosis and should be verified before treatment decisions."
        ),
    }
