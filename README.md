# CasePilot

CasePilot is a complaint-intelligence demo for financial services. It classifies English banking complaints, predicts sentiment, assigns routing priority, and presents results through a web dashboard and FastAPI service.

## Dataset

The training corpus was sourced from the public Consumer Financial Protection Bureau (CFPB) Consumer Complaint Database (`complaints.csv.zip`). Records without a `Consumer complaint narrative` were removed because the model requires complaint text. The target was the dataset's `Issue` field, encoded with scikit-learn `LabelEncoder` into 43 classes. The data represents real-world consumer complaints and includes noisy, varied descriptions. Personally identifying information is not intentionally used as a feature. The project brief proposes an external African-English complaint corpus for future cross-domain testing; the checked-in notebook trains and evaluates on the CFPB corpus.

## Training Pipeline

The notebook `Notebook/Customer_complaints_with_transformer_model.ipynb` contains the workflow:

1. Read the CFPB CSV in 100,000-row chunks and retain complaint narratives.
2. Remove missing narratives and normalize text by lowercasing, removing redaction tokens such as `XXXX`, removing non-letter characters, and collapsing whitespace.
3. Encode `Issue` labels and split the data into 80% training and 20% testing partitions with `random_state=42` and stratification.
4. Tokenize with `distilbert-base-uncased` and fine-tune `AutoModelForSequenceClassification` for 43 labels.
5. Train with learning rate `2e-5`, batch size 16, weight decay `0.01`, three epochs, evaluation/checkpointing each epoch, and best-checkpoint loading.
6. Save the model/tokenizer to `Model/distilbert_issue_model/` and the label encoder to `Model/distilbert_label_encoder.pkl`.

A separate sentiment pipeline uses CardiffNLP's `twitter-roberta-base-sentiment-latest`. The API uses that local model when available; otherwise it uses a deterministic lexicon fallback. Detailed issue labels are mapped to broader operational categories for routing.

## Evaluation

The notebook evaluates each epoch with accuracy and weighted F1 on a held-out stratified split. Recorded validation results were:

| Epoch | Accuracy | Weighted F1 |
|---|---:|---:|
| 1 | 0.405 | 0.284 |
| 2 | 0.456 | 0.365 |
| 3 | 0.471 | 0.386 |

The notebook imports precision, recall, classification reports, and confusion-matrix tooling for detailed error analysis. This checkpoint is a working baseline, not a production-grade classifier. The application was additionally verified through API health, live classification, label-encoder loading, CORS preflight, persisted complaint-list requests, and frontend builds.

## Reproduction

Requirements: Node.js, npm, Python 3.11+, and Git LFS.

```powershell
git lfs install
git clone https://github.com/Janeworld001/C10-team-manapools.git
cd C10-team-manapools
git lfs pull
npm install
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r Model\requirements.txt
```

Run the API in terminal one:

```powershell
python -m uvicorn Model.api.main:app --reload --port 8000
```

Run the frontend in terminal two:

```powershell
npm run dev
```

Open `http://localhost:5173`; check readiness at `http://localhost:8000/health`. To reproduce training, open the notebook and run its cells in order. To validate the app, run `npm run build` and `python -m py_compile Model\api\main.py`.

The API provides `POST /api/v1/classify` with `{ "customer": "Name", "text": "complaint" }` and `GET /api/v1/complaints`. Cases are stored in `data/support-sense.db`; set `DATA_DIR` to a persistent directory in deployment.

## Appendix

**Contributors/team members**

- Moromoke Janet Bello (`moromoke01`)
- Ayikson Koffi Mawunyo Kevin
- Palayan Grace Junily

**Mentors**

- David Taiwo Balogun

**References**

- Consumer Financial Protection Bureau, Consumer Complaint Database: https://www.consumerfinance.gov/data-research/consumer-complaints/
- Sanh et al., DistilBERT: https://arxiv.org/abs/1910.01108
- CardiffNLP Twitter RoBERTa sentiment model: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
