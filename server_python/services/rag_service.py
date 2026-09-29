import os
import re
from typing import List, Dict, Any

class RAGService:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.documents_dir = os.path.join(current_dir, "../rag/documents")
        self.chunks: List[Dict[str, Any]] = []
        self.initialized = False

    def initialize(self):
        if self.initialized:
            return

        if not os.path.exists(self.documents_dir):
            os.makedirs(self.documents_dir, exist_ok=True)

        self.chunks = []
        files = os.listdir(self.documents_dir)

        for file_name in files:
            if file_name.endswith(".txt") or file_name.endswith(".md"):
                file_path = os.path.join(self.documents_dir, file_name)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    file_chunks = self._split_sections(content, file_name)
                    self.chunks.extend(file_chunks)

        self.initialized = True
        print(f"[OK] Python RAG Knowledge Base indexed: {len(self.chunks)} chunks from {len(files)} documents.")

    def _split_sections(self, text: str, source: str) -> List[Dict[str, Any]]:
        raw_sections = re.split(r'\n(?=#{1,3}\s|\d+\.\s)', text)
        result = []
        for i, sec in enumerate(raw_sections):
            cleaned = sec.strip()
            if len(cleaned) > 20:
                result.append({
                    "id": f"{source}-chunk-{i}",
                    "source": source,
                    "text": cleaned
                })
        return result

    def _score_chunk(self, query_tokens: List[str], chunk_text: str) -> float:
        chunk_tokens = set(re.findall(r'\b\w{3,}\b', chunk_text.lower()))
        if not chunk_tokens:
            return 0.0

        score = 0.0
        for token in query_tokens:
            if token in chunk_tokens:
                score += 1.0
            if token in chunk_text.lower():
                score += 0.5

        return score

    def retrieve_context(self, query: str, top_k: int = 4) -> str:
        self.initialize()

        if not self.chunks:
            return "Standard cognizable offence recording per police guidelines."

        query_tokens = re.findall(r'\b\w{3,}\b', (query or "").lower())
        if not query_tokens:
            return "\n\n---\n\n".join([c["text"] for c in self.chunks[:top_k]])

        scored = []
        for chunk in self.chunks:
            s = self._score_chunk(query_tokens, chunk["text"])
            scored.append({**chunk, "score": s})

        scored.sort(key=lambda x: x["score"], reverse=True)
        top_chunks = scored[:top_k]
        return "\n\n---\n\n".join([f"[Source: {c['source']}]\n{c['text']}" for c in top_chunks])

rag_service = RAGService()
