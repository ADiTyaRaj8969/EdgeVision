from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
from PIL import Image, ImageFilter, ImageOps
import io
import math
import os

app = Flask(__name__)
CORS(app)

# Serve the main frontend page
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():         
    try:
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        # Get parameters
        algorithm = request.form.get('algorithm', 'canny')
        sensitivity = int(request.form.get('sensitivity', 5))
        
        print(f"Processing image with {algorithm} algorithm, sensitivity: {sensitivity}")
        
        # Open and process image
        image = Image.open(file.stream)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Apply selected algorithm
        if algorithm == 'canny':
            processed_image = canny_edge_detection(image, sensitivity)
        elif algorithm == 'sobel':
            processed_image = sobel_edge_detection(image, sensitivity)
        elif algorithm == 'laplacian':
            processed_image = laplacian_edge_detection(image, sensitivity)
        else:
            return jsonify({"error": "Unknown algorithm"}), 400
        
        # Convert to bytes
        img_io = io.BytesIO()
        processed_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def canny_edge_detection(image, sensitivity):
    """Canny Edge Detection Algorithm"""
    # Convert to grayscale
    gray = image.convert('L')
    
    # Step 1: Gaussian blur to reduce noise
    blurred = gray.filter(ImageFilter.GaussianBlur(radius=1))
    
    # Step 2: Find edges using built-in filter
    edges = blurred.filter(ImageFilter.FIND_EDGES)
    
    # Step 3: Adjust threshold based on sensitivity
    threshold = max(20, 120 - (sensitivity * 10))
    edges = edges.point(lambda x: 255 if x > threshold else 0)
    
    # Convert back to RGB for consistent output
    return edges.convert('RGB')

def sobel_edge_detection(image, sensitivity):
    """Sobel Edge Detection Algorithm"""
    # Convert to grayscale
    gray = image.convert('L')
    
    # Apply Sobel-like edge detection
    edges = gray.filter(ImageFilter.FIND_EDGES)
    
    # Enhance based on sensitivity
    enhance_factor = 0.5 + (sensitivity * 0.1)
    edges = edges.point(lambda x: min(255, int(x * enhance_factor)))
    
    # Increase contrast
    edges = ImageOps.autocontrast(edges, cutoff=2)
    
    return edges.convert('RGB')

def laplacian_edge_detection(image, sensitivity):
    """Laplacian Edge Detection Algorithm"""
    # Convert to grayscale
    gray = image.convert('L')
    
    # Apply Gaussian blur first
    blurred = gray.filter(ImageFilter.GaussianBlur(radius=0.5 + (sensitivity * 0.1)))
    
    # Apply Laplacian-like filter (edge enhancement + find edges)
    sharpened = blurred.filter(ImageFilter.EDGE_ENHANCE_MORE)
    edges = sharpened.filter(ImageFilter.FIND_EDGES)
    
    # Adjust based on sensitivity
    threshold = max(15, 80 - (sensitivity * 6))
    edges = edges.point(lambda x: 255 if x > threshold else 0)
    
    return edges.convert('RGB')

@app.route('/algorithms', methods=['GET'])
def get_algorithms():
    """Return information about available algorithms"""
    algorithms = {
        "canny": {
            "name": "Canny Edge Detector",
            "description": "Multi-stage algorithm with noise reduction and double thresholding",
            "best_for": "Clean, precise edge detection"
        },
        "sobel": {
            "name": "Sobel Operator", 
            "description": "Gradient-based edge detection using convolution kernels",
            "best_for": "Fast edge detection with good performance"
        },
        "laplacian": {
            "name": "Laplacian of Gaussian",
            "description": "Second-derivative operator for fine edge detection",
            "best_for": "Detailed edge detection in high-quality images"
        }
    }
    return jsonify(algorithms)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Edge Detection API is running"})

@app.route('/api')
def api_info():
    return jsonify({
        "message": "Edge Detection API is Running!",
        "status": "success",
        "algorithms": ["canny", "sobel", "laplacian"]
    })

if __name__ == '__main__':
    print(" Starting Edge Detection Server...")
    print(" API URL: http://localhost:5000")
    print("Available algorithms: canny, sobel, laplacian")
    print(" Send POST requests to /upload with image file and algorithm parameter")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)