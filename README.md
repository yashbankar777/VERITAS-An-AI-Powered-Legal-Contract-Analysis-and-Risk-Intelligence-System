# ⚖️ VERITAS

### 🧠 Hybrid Neuro-Symbolic AI for Legal Contract Intelligence

VERITAS is a hybrid neuro-symbolic AI system that analyzes legal contracts using transformer-based NLP, ontology-driven symbolic reasoning, and explainable AI to generate clause insights, risk analysis, and contract intelligence reports.

---

# 📖 Overview

Modern legal contracts are lengthy, complex, and difficult to review manually at scale.
VERITAS was developed as an end-to-end AI-powered legal intelligence system capable of:

* Segmenting raw legal contracts into clauses
* Classifying clauses using Legal-BERT
* Enriching clauses through ontology-based symbolic reasoning
* Performing heuristic risk analysis
* Generating explainable legal and business interpretations
* Producing contract-level intelligence reports

The system combines multiple AI paradigms into a unified architecture, moving beyond traditional single-model NLP pipelines.

---

# 📊 Dataset Information

VERITAS was primarily developed using the **CUAD (Contract Understanding Atticus Dataset)** for legal clause extraction, annotation, and classification tasks.

Key dataset files used:

* `test.json`
* `train_separate_questions.json`

The system was trained and evaluated on commercial contract clauses covering areas such as:

* governing law
* termination
* indemnification
* intellectual property
* warranties
* exclusivity
* liability limitations
* dispute resolution

Additional synthetic and manually enriched datasets were also created to improve ontology coverage, class balance, and explainability generation. 

---

# 🧠 AI Paradigms Implemented

VERITAS integrates multiple artificial intelligence paradigms into one layered system:

| Paradigm                                   | Purpose                                                        |
| ------------------------------------------ | -------------------------------------------------------------- |
| Transformer NLP                            | Legal clause classification using Legal-BERT                   |
| Symbolic AI                                | Ontology-driven legal reasoning                                |
| Neuro-Symbolic AI                          | Integration of neural inference with symbolic knowledge graphs |
| Explainable AI (XAI)                       | Human-readable clause and risk explanations                    |
| Generative AI                              | Structured contract intelligence reporting                     |
| Knowledge Representation & Reasoning (KRR) | Ontology relationships and dependency mapping                  |

---

# 🏗️ System Architecture

```text id="g1"
Raw Legal Contract
        ↓
Clause Segmentation
        ↓
Legal-BERT Clause Classification
        ↓
Ontology Enrichment & Symbolic Reasoning
        ↓
Risk Scoring & Dependency Analysis
        ↓
LLM / Offline Explainability Layer
        ↓
Contract Intelligence Report
```

---

# 🔄 Cross-Notebook Architecture Flow

VERITAS was intentionally designed as a layered pipeline where each notebook produces artifacts consumed by the next stage of the system.

---

## 📘 Notebook 01 → Legal-BERT Clause Classification

Notebook 01 performs:

* CUAD preprocessing and cleaning
* Clause label mapping
* Legal-BERT fine-tuning
* Model evaluation and testing

### Outputs Generated

```text id="g2"
legal_bert_classifier/
```

Contains:

* trained Legal-BERT model
* tokenizer files
* label_classes.npy
* configuration artifacts

These outputs become the **Neural AI layer** used later by Notebook 03 for real-time clause classification inference.

---

## 📗 Notebook 02 → Legal Ontology & Knowledge Graph

Notebook 02 builds the symbolic reasoning layer on top of the legal clause categories established in Notebook 01.

It creates:

* legal ontologies
* risk-domain mappings
* dependency relationships
* symbolic knowledge graphs
* graph centrality analysis

### Outputs Generated

```text id="g3"
ontology_artifacts/
```

Contains:

* ontology_graph.graphml
* ontology_edges.csv
* ontology_nodes.csv
* centrality_analysis.csv
* enriched clause datasets

These outputs become the **Symbolic AI layer** used later by Notebook 03 for ontology enrichment and risk reasoning.

---

## 📙 Notebook 03 → Hybrid AI Reasoning & Explainability

Notebook 03 acts as the orchestration layer integrating:

* Neural AI from Notebook 01
* Symbolic AI from Notebook 02
* Explainability and report generation

### Runtime Pipeline

```text id="g4"
Raw Contract
      ↓
Clause Segmentation
      ↓
Legal-BERT Inference (NB01 artifacts)
      ↓
Ontology Querying & Symbolic Enrichment (NB02 artifacts)
      ↓
Risk Scoring
      ↓
LLM / Fallback Explainability
      ↓
Contract Intelligence Report
```

This notebook powers the final Flask frontend application and produces the complete end-to-end legal intelligence workflow.

---

# 📁 Project Structure

```text id="g5"
VERITAS/
│
├── app.py
├── nb03_pipeline.py
│
├── templates/
│     └── index.html
│
├── static/
│     ├── style.css
│     └── app.js
│
├── legal_bert_classifier/
├── ontology_artifacts/
├── nb03_cache/
├── nb03_outputs/
│
├── 01_clause_classification_BERT.ipynb
├── 02_legal_ontology_and_knowledge_graph.ipynb
├── 03_reasoning_and_explainability_GenAI.ipynb
│
└── README.md
```

---

# 📘 Notebook Breakdown

## Notebook 01 — Legal-BERT Clause Classification

Implements transformer-based legal clause classification using a fine-tuned Legal-BERT architecture trained on the CUAD dataset.

### Features

* Legal-BERT fine-tuning
* Clause type prediction
* Confidence scoring
* Dataset preprocessing and cleaning
* Evaluation metrics and confusion matrix generation

---

## Notebook 02 — Legal Ontology & Knowledge Graph

Implements symbolic AI and knowledge representation using a manually constructed legal ontology.

### Features

* Ontology graph construction
* Legal concept relationships
* Risk-domain mapping
* Clause dependency modeling
* Graph centrality analysis
* Knowledge graph exports

---

## Notebook 03 — Hybrid AI Reasoning & Explainability

Implements the full orchestration pipeline integrating neural AI, symbolic AI, and explainability layers.

### Features

* Raw contract ingestion
* Clause segmentation
* Legal-BERT inference
* Ontology enrichment
* Symbolic risk scoring
* Explainable clause analysis
* Contract-level intelligence reports
* Offline fallback reasoning mode

---

# 💻 Frontend Interface

VERITAS includes a lightweight Flask-based frontend interface for demonstrating the complete AI pipeline interactively.

### Frontend Features

* Raw contract text input
* Contract upload support
* Clause analysis dashboard
* Risk visualizations
* Expandable clause intelligence cards
* Contract-level reporting
* Export functionality

---

# 🛠️ Technologies Used

| Category        | Technologies             |
| --------------- | ------------------------ |
| Programming     | Python                   |
| NLP             | Transformers, Legal-BERT |
| Deep Learning   | PyTorch                  |
| Symbolic AI     | NetworkX                 |
| Data Processing | Pandas, NumPy            |
| Frontend        | HTML, CSS, JavaScript    |
| Backend         | Flask                    |
| Visualization   | Matplotlib               |

---

# ⚡ Example Capabilities

VERITAS can identify and analyze clauses such as:

* Termination clauses
* Governing law clauses
* Limitation of liability clauses
* Intellectual property clauses
* Confidentiality and non-compete clauses
* Indemnification clauses
* Payment-related clauses
* Warranty clauses
* Change-of-control clauses
* Dispute resolution clauses

The system then enriches these classifications with:

* ontology-driven legal concepts
* symbolic risk domains
* clause dependencies
* business implications
* explainable summaries

---

# 🚀 Running the Project

## 1. Clone the Repository

```bash id="g6"
git clone https://github.com/your-username/VERITAS.git
cd VERITAS
```

---

## 2. Install Dependencies

```bash id="g7"
pip install flask transformers torch pandas numpy networkx matplotlib
```

---

## 3. Run the Application

```bash id="g8"
python app.py
```

---

## 4. Open in Browser

```text id="g9"
http://127.0.0.1:5000
```

---

# ⚠️ Important Notes

* VERITAS is an academic/research-oriented project.
* Risk scores are heuristic symbolic approximations and not formal legal advice.
* Certain large artifacts, cache files, generated outputs, and datasets are excluded from the repository due to storage constraints.
* The system supports both:

  * real LLM mode
  * offline fallback explainability mode

---

# 🔮 Future Improvements

Potential future enhancements include:

* PDF and DOCX contract ingestion
* Retrieval-Augmented Generation (RAG)
* Advanced legal entity extraction
* Multi-document reasoning
* Interactive ontology exploration
* Contract comparison engine
* Real-time legal compliance analysis

---

# 👨‍💻 Authors

Developed as part of an advanced AI and intelligent systems project exploring hybrid neuro-symbolic legal intelligence architectures.

---

# ⚖️ VERITAS

> Truth through intelligence.
