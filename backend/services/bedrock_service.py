import json
import os
from pathlib import Path

import boto3
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


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
    prompt = prompt = f"""
    You are an expert travel assistant. Generate a detailed {days}-day itinerary for {destination} with a total budget of ${budget} using a {travel_style} travel style.

    CRITICAL REQUIREMENTS:
    1. markdown with headers(##) and bullet list (-) every daily itinerary (morning activities : 2-3 activities, afternoon activities : visit cultural sites and trying local experiences, evening activities : dinner and night life),  and local food recommendations include an estimated cost in USD (e.g., "Breakfast at local restaurant (~$5)").
    2. give a travel tips section
    3. make total dailybudget at the end of the itinerary.
    4. At the VERY END of the response, you MUST provide a "Budget Breakdown" section formatted like this:
       
       ---
       **Budget Breakdown:**
       - **Accommodation**: Estimated cost
       - **Food**: Estimated cost
       - **Transport**: Estimated cost
       - **Entrance Fees**: Estimated cost
       - **Miscellaneous**: Estimated cost
       
       **Total**: $X (leaving a buffer for unexpected expenses)

    Ensure the total estimated budget strictly fits within ${budget}.
    """
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
