# Edge Detection App

A simple web app for applying edge-detection algorithms to images. The backend is a Flask API that processes uploaded images and returns the result. Frontend is served from `Backend/templates/index.html` and static files in `Backend/static/`.

## Features
- Multiple edge detection algorithms: Canny, Sobel, Laplacian
- Adjustable sensitivity control for each algorithm
- Preview original and processed images
- Lightweight Flask backend using Pillow for image processing

## Tech stack
- Python 3.8+
- Flask
- Pillow (PIL)
- Flask-CORS
- HTML / CSS / JavaScript frontend

## File structure
```
Edge Detection App/
├─ Backend/
│  ├─ app.py                # Flask backend and endpoints
│  ├─ edge_detector.py      # (optional) helper for algorithms (if present)
│  ├─ templates/
│  │  └─ index.html         # Frontend page
│  └─ static/
│     ├─ style.css          # App styles
│     └─ script.js          # Frontend JS
```

## Requirements
Install Python 3.8 or later. The project depends on:
- flask
- pillow
- flask-cors

You can install them with pip:

PowerShell (recommended):
```powershell
cd "d:\5th Semester\Digital Signal Image Processing\End Semester Exam\Edge Detection App\Backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install flask pillow flask-cors
```

Or using system Python:
```powershell
pip install flask pillow flask-cors
```

(Optionally create a `requirements.txt` with `flask\npillow\nflask-cors`.)

## Running the app
From the `Backend` folder run:

```powershell
cd "d:\5th Semester\Digital Signal Image Processing\End Semester Exam\Edge Detection App\Backend"
python .\app.py
```

By default the app runs on `http://localhost:5000` and serves the frontend at `/`.

## API
- `GET /algorithms` — returns available algorithms and short descriptions
- `GET /health` — health check
- `POST /upload` — upload an image (multipart/form-data) and receive processed PNG

Example `curl` request (replace `image.jpg` with your file):

```bash
curl -X POST "http://localhost:5000/upload" -F "file=@image.jpg" -F "algorithm=canny" -F "sensitivity=5" --output result.png
```

## Styling notes
I updated the app's `Backend/static/style.css` with a clean minimal theme (indigo & amber) and simplified layout. If you'd like a different preset or a dark mode toggle, I can add it.

---

## 🔗 Connect with Me

- 🔗 GitHub: [@ADiTyaRaj8969](https://github.com/ADiTyaRaj8969)  
- ✉️ Email: adivid198986@gmail.com  
- 💼 LinkedIn: [Aditya Raj](https://www.linkedin.com/in/aditya-raj-710a5a291/)

---

If you want, I can also:
- Add a `requirements.txt` file
- Add a short CONTRIBUTING guide
- Add a GitHub Actions workflow to run a lint/test step

Feel free to tell me which of these you'd like next.
