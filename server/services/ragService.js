const fs = require("fs");
const path = require("path");

class RAGService {
  constructor() {
    this.documentsDir = path.join(__dirname, "../rag/documents");
    this.chunks = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      if (!fs.existsSync(this.documentsDir)) {
        fs.mkdirSync(this.documentsDir, { recursive: true });
      }

      const files = fs.readdirSync(this.documentsDir);
      this.chunks = [];

      for (const file of files) {
        if (file.endsWith(".txt") || file.endsWith(".md")) {
          const filePath = path.join(this.documentsDir, file);
          const content = fs.readFileSync(filePath, "utf-8");
          const fileChunks = this.splitIntoSections(content, file);
          this.chunks.push(...fileChunks);
        }
      }

      this.initialized = true;
      console.log(`✓ RAG Knowledge Base indexed: ${this.chunks.length} chunks from ${files.length} documents.`);
    } catch (error) {
      console.error("Error initializing RAG knowledge base:", error);
    }
  }

  splitIntoSections(text, source) {
    const sections = text.split(/\n(?=#{1,3}\s|\d+\.\s)/);
    return sections
      .map((sec, index) => ({
        id: `${source}-chunk-${index}`,
        source,
        text: sec.trim()
      }))
      .filter(chunk => chunk.text.length > 20);
  }

  // Tokenize and calculate relevance score
  scoreChunk(queryTokens, chunkText) {
    const chunkTokens = chunkText.toLowerCase().match(/\b\w{3,}\b/g) || [];
    if (chunkTokens.length === 0) return 0;

    let score = 0;
    const chunkTokenSet = new Set(chunkTokens);

    for (const token of queryTokens) {
      if (chunkTokenSet.has(token)) {
        score += 1;
      }
    }

    // Boost chunks that mention specific crime categories or rules
    const lower = chunkText.toLowerCase();
    for (const token of queryTokens) {
      if (lower.includes(token)) {
        score += 0.5;
      }
    }

    return score;
  }

  async retrieveContext(query, topK = 4) {
    await this.initialize();

    if (!this.chunks.length) {
      return "Default FIR Reference: Standard cognizable offence recording per police guidelines.";
    }

    const queryTokens = (query || "").toLowerCase().match(/\b\w{3,}\b/g) || [];
    
    if (queryTokens.length === 0) {
      return this.chunks.slice(0, topK).map(c => c.text).join("\n\n---\n\n");
    }

    const scored = this.chunks.map(chunk => ({
      ...chunk,
      score: this.scoreChunk(queryTokens, chunk.text)
    }));

    scored.sort((a, b) => b.score - a.score);

    const relevant = scored.slice(0, topK);
    return relevant.map(c => `[Source: ${c.source}]\n${c.text}`).join("\n\n---\n\n");
  }
}

const ragService = new RAGService();
module.exports = ragService;
