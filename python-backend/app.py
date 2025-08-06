from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:3000"])

model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/similarity', methods=['POST'])
def compute_similarity():
    data = request.get_json()

    phrase1 = data.get('phrase1')
    phrase2 = data.get('phrase2')

    if not phrase1 or not phrase2:
        return jsonify({'error': 'Both phrase1 and phrase2 are required'}), 400

    emb1 = model.encode(phrase1, convert_to_tensor=True)
    emb2 = model.encode(phrase2, convert_to_tensor=True)
    score = util.pytorch_cos_sim(emb1, emb2).item()

    return jsonify({'similarity': score})

if __name__ == '__main__':
    app.run(debug=True)
