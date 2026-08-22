import json
import os
from pathlib import Path

import boto3
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent / ".env")


def configure_bedrock():
    """Create a Bedrock Runtime client from the local environment."""
    region = os.getenv("AWS_REGION")
    bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    if not region:
        raise ValueError("AWS_REGION is missing from backend/.env")
    if not bearer_token:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK is missing from backend/.env")

    return boto3.client("bedrock-runtime", region_name=region)


def get_ai_recommendation(days, destination, budget, travel_style):
    """Generate a travel itinerary using the configured Bedrock model."""
    prompt = (
        "You are an experienced travel planner. "
        f"Plan a {days} - day itinerary for {destination}. "
        f"Budget: {budget} Travel Style: {travel_style}"
    )
    model_id = os.getenv("MODEL_ID")
    if not model_id:
        raise ValueError("MODEL_ID is missing from backend/.env")

    request_body = {
        "schemaVersion": "messages-v1",
        "messages": [
            {"role": "user", "content": [{"text": prompt}]}
        ],
        "inferenceConfig": {"max_new_tokens": 2000},
    }
    response = configure_bedrock().invoke_model(
        modelId=model_id,
        body=json.dumps(request_body),
        contentType="application/json",
        accept="application/json",
    )
    response_body = json.loads(response["body"].read())
    return "".join(
        content["text"]
        for content in response_body.get("output", {})
        .get("message", {})
        .get("content", [])
        if "text" in content
    )