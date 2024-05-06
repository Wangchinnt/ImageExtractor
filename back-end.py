from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import requests
from io import BytesIO

app = Flask(__name__)
CORS(app, resources={r"/process_images": {"origins": "*"}})  # Allow requests from all origins

@app.route('/process_images', methods=['POST'])
def process_images():
    data = request.get_json()
    images = data.get('images')
    
    processed_data = []
    for image in images:
        try:
            # Download image from URL
            response = requests.get(image['src'])
            img = Image.open(BytesIO(response.content))
            img.show()
            # Convert image to numpy array
            img_np = np.array(img)
            print(img_np.shape)
            # Process image
            ##
            ##
            # Append processed image to response
            processed_data.append({'image': image, 'processed_value': True})
        except Exception as e:
            print(f"Error processing image from {image}: {e}")
    
    return jsonify({'processed_data': processed_data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
