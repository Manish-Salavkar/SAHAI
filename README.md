# SAH.ai — Smart Access to Government Resolutions

SAH.ai is a multimodal Retrieval-Augmented Generation (RAG) platform designed to make Maharashtra Government Resolutions (GRs) accessible through intelligent, context-aware search and natural language interaction.

The system combines automated document ingestion, semantic indexing, and LLM-powered retrieval to process and understand a large repository of government documents, including text-heavy and scanned PDFs.

### Key Features

- **Large-Scale Document Ingestion:** Asynchronous web scraping pipeline for collecting 100K+ government resolution PDFs.
- **PDF Processing:** PyMuPDF-based text extraction, cleaning, structural segmentation, and document preprocessing.
- **Semantic Retrieval:** Sentence Transformers and BGE-M3 embeddings integrated with ChromaDB for vector-based document retrieval.
- **Context-Aware Chunking:** Structured document chunking with previous/next chunk references to preserve contextual continuity during retrieval.
- **Multimodal Document Understanding:** Vision-language model experimentation using Qwen3-VL-30B-A3B and Gemma 26B for extracting information from image-based document content.
- **LLM-Powered Responses:** Gemini integration for generating contextual answers grounded in retrieved government documents.
- **Source Attribution:** Citation-backed responses that allow users to trace generated information to the original government resolutions.

### Technology Stack

**Backend:** Python, FastAPI  
**RAG & AI:** Gemini, Sentence Transformers, BGE-M3, Qwen3-VL, Gemma  
**Vector Database:** ChromaDB  
**Database:** SQLite  
**Document Processing:** PyMuPDF  
**Architecture:** Retrieval-Augmented Generation (RAG), Multimodal AI, Asynchronous Document Processing