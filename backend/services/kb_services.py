import os
from pathlib import Path

import boto3
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

def ask_knowledge_base (question: str):
    region = os.getenv("AWS_REGION")
    knowledge_base_id = os.getenv("KNOWLEDGE_BASE_ID")
    if not region:
        raise ValueError("AWS_REGION is missing from backend/.env")
    if not knowledge_base_id:
        raise ValueError("KNOWLEDGE_BASE_ID is missing from backend/.env")

    client = boto3.client("bedrock-agent-runtime", region_name=region)
    response = client.retrieve(
        knowledgeBaseId=knowledge_base_id,
        retrievalQuery={"text": question},
        retrievalConfiguration={
            "managedSearchConfiguration": {
                "numberOfResults": 5,
            }
        },
    )
    results = response.get("retrievalResults", [])
    answer = "\n\n".join(
        result.get("content", {}).get("text", "")
        for result in results
        if result.get("content", {}).get("text")
    )
    return answer or "Tidak ditemukan informasi yang relevan di Knowledge Base."