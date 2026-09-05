import os
from posixpath import basename
from pathlib import Path
from urllib.parse import unquote, urlparse

import boto3
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def get_document_name(source_location: str) -> str:
    path = urlparse(source_location).path or source_location
    document_name = basename(unquote(path.rstrip("/")))
    return document_name or "Sumber tidak diketahui"

def ask_knowledge_base(question: str):
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
    source_scores = {}
    relevance_scores = []
    for result in results:
        location = result.get("location", {})
        source_location = (
            location.get("s3Location", {}).get("uri")
            or location.get("webLocation", {}).get("url")
            or location.get("confluenceLocation", {}).get("url")
            or location.get("sharePointLocation", {}).get("url")
            or location.get("customDocumentLocation", {}).get("id")
            or "Sumber tidak diketahui"
        )
        document_name = get_document_name(source_location)
        score = result.get("score")
        if isinstance(score, (int, float)):
            relevance_scores.append(score)
            existing_score = source_scores.get(document_name)
            source_scores[document_name] = (
                max(score, existing_score)
                if isinstance(existing_score, (int, float))
                else score
            )
        elif document_name not in source_scores:
            source_scores[document_name] = None

    sources = [
        {"source": source, "relevance_score": score}
        for source, score in source_scores.items()
    ]
    average_relevance_score = (
        sum(relevance_scores) / len(relevance_scores)
        if relevance_scores
        else None
    )
    accuracy_message = (
        f"Akurasi hasil rendah (rata-rata score: {average_relevance_score:.4f})"
        if average_relevance_score is not None and average_relevance_score < 0.6
        else None
    )

    if not answer:
        answer = "Tidak ditemukan informasi yang relevan di Knowledge Base."

    if sources:
        answer += "\n\n---\n**Sources & Relevance:**\n"
        if average_relevance_score is not None:
            answer += (
                f"- Rata-rata score: {average_relevance_score:.4f}\n"
            )
        if accuracy_message:
            answer += f"- {accuracy_message}\n"
        answer += "\n".join(
            f"- {item['source']} (score: {item['relevance_score']:.4f})"
            if isinstance(item["relevance_score"], (int, float))
            else f"- {item['source']} (score: tidak tersedia)"
            for item in sources
        )

    return {
        "answer": answer,
        "sources": sources,
        "average_relevance_score": average_relevance_score,
        "accuracy_message": accuracy_message,
    }