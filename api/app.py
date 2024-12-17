from flask import Flask, request, jsonify
import os
from model import load_model, preprocess_image, predict
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Load the model once when the app starts
MODEL_PATH = 'model_skin_cancer.pth'  # Path to your PyTorch model
model = load_model(MODEL_PATH)

# Ensure the static folder exists for temporary image storage
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/predict', methods=['POST'])
def predict_skin_cancer():
    # Check if an image file is present in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        # Preprocess the image
        image_tensor = preprocess_image(file_path)

        # Make a prediction
        prediction = predict(model, image_tensor)

        # Map prediction index to label (update based on your model's output classes)
        labels = {0: 'Benign', 1: 'Malignant'}
        result = labels.get(prediction, 'Unknown')

        return jsonify({'prediction': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Cleanup: Remove the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

# Run the app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000,debug=True)
