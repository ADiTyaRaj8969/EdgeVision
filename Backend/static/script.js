document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browseBtn");
  const detectBtn = document.getElementById("detectBtn");
  const resetBtn = document.getElementById("resetBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const newDetectionBtn = document.getElementById("newDetectionBtn");
  const changeImageBtn = document.getElementById("changeImageBtn");
  const algorithmCards = document.querySelectorAll(".algorithm-card");
  const algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
  const thresholdSlider = document.getElementById("thresholdSlider");
  const thresholdValue = document.getElementById("thresholdValue");
  const presetButtons = document.querySelectorAll(".preset-btn");
  const originalImage = document.getElementById("originalImage");
  const originalImageResult = document.getElementById("originalImageResult");
  const processedImage = document.getElementById("processedImage");
  const imagePreview = document.getElementById("imagePreview");
  const resultsSection = document.getElementById("resultsSection");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const notification = document.getElementById("notification");
  const progressText = document.getElementById("progressText");
  const progressFill = document.querySelector(".progress-fill");
  const fileName = document.getElementById("fileName");
  const fileSize = document.getElementById("fileSize");
  const fileDimensions = document.getElementById("fileDimensions");
  const algorithmBadge = document.getElementById("algorithmBadge");
  const processingTime = document.getElementById("processingTime");
  const imageSizeStat = document.getElementById("imageSize");
  const algorithmUsed = document.getElementById("algorithmUsed");

  // Variables
  let currentFile = null;
  let processedImageUrl = null;
  let startTime = null;

  // Event Listeners
  browseBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFileSelect);
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleDrop);
  detectBtn.addEventListener("click", detectEdges);
  resetBtn.addEventListener("click", resetApp);
  downloadBtn.addEventListener("click", downloadImage);
  newDetectionBtn.addEventListener("click", resetApp);
  changeImageBtn.addEventListener("click", () => fileInput.click());
  thresholdSlider.addEventListener("input", updateThresholdValue);

  // Algorithm selection
  algorithmCards.forEach((card) => {
    card.addEventListener("click", function () {
      const algorithm = this.dataset.algorithm;
      document.querySelector(`#${algorithm}`).checked = true;
      updateAlgorithmSelection();
    });
  });

  algorithmRadios.forEach((radio) => {
    radio.addEventListener("change", updateAlgorithmSelection);
  });

  // Preset buttons
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const value = this.dataset.value;
      thresholdSlider.value = value;
      updateThresholdValue();

      // Update active state
      presetButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Initialize
  updateThresholdValue();
  updateAlgorithmSelection();

  // Functions
  function handleFileSelect(e) {
    const file = e.target.files[0];
    processFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add("active");
  }

  function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove("active");
  }

  function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove("active");
    const file = e.dataTransfer.files[0];
    processFile(file);
  }

  function processFile(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      showNotification(
        "Please select a valid image file (JPG, PNG, WEBP, GIF)",
        "error"
      );
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification("File size must be less than 10MB", "error");
      return;
    }

    currentFile = file;

    // Display original image
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        originalImage.src = e.target.result;
        originalImageResult.src = e.target.result;

        // Update file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileDimensions.textContent = `${img.width} × ${img.height}`;

        // Show preview section
        imagePreview.style.display = "block";
        detectBtn.disabled = false;

        // Scroll to preview
        imagePreview.scrollIntoView({ behavior: "smooth", block: "center" });

        showNotification("Image uploaded successfully!", "success");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updateThresholdValue() {
    const value = thresholdSlider.value;
    thresholdValue.textContent = value;

    // Update gradient
    const percentage =
      ((value - thresholdSlider.min) /
        (thresholdSlider.max - thresholdSlider.min)) *
      100;
    thresholdSlider.style.background = `linear-gradient(to right, #e2e8f0 0%, #1e40af ${percentage}%, #e2e8f0 ${percentage}%)`;

    // Update preset buttons
    presetButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === value);
    });
  }

  function updateAlgorithmSelection() {
    const selectedAlgorithm = document.querySelector(
      'input[name="algorithm"]:checked'
    ).value;

    algorithmCards.forEach((card) => {
      card.classList.toggle(
        "selected",
        card.dataset.algorithm === selectedAlgorithm
      );
    });

    algorithmBadge.textContent = getAlgorithmName(selectedAlgorithm);
  }

  function getAlgorithmName(algorithm) {
    const names = {
      canny: "Canny",
      sobel: "Sobel",
      laplacian: "Laplacian",
    };
    return names[algorithm] || algorithm;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function detectEdges() {
    if (!currentFile) {
      showNotification("Please select an image first", "error");
      return;
    }

    startTime = Date.now();
    showLoading(true);
    updateProgress(0);

    const formData = new FormData();
    formData.append("file", currentFile);
    formData.append(
      "algorithm",
      document.querySelector('input[name="algorithm"]:checked').value
    );
    formData.append("sensitivity", thresholdSlider.value);

    // Simulate progress updates
    simulateProgress();

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || "Server error");
          });
        }
        return response.blob();
      })
      .then((blob) => {
        updateProgress(100);
        processedImageUrl = URL.createObjectURL(blob);
        processedImage.src = processedImageUrl;

        // Calculate processing time
        const endTime = Date.now();
        const processingTimeMs = endTime - startTime;
        processingTime.textContent = `${processingTimeMs}ms`;

        // Update other stats
        imageSizeStat.textContent = fileDimensions.textContent;
        algorithmUsed.textContent = getAlgorithmName(
          document.querySelector('input[name="algorithm"]:checked').value
        );

        // Show results with animation
        setTimeout(() => {
          showLoading(false);
          resultsSection.style.display = "block";
          showNotification(
            `Edge detection completed using ${getAlgorithmName(
              document.querySelector('input[name="algorithm"]:checked').value
            )} algorithm!`,
            "success"
          );

          // Scroll to results
          resultsSection.scrollIntoView({ behavior: "smooth" });

          // Show success overlay
          const overlay = document.querySelector(".result-overlay");
          overlay.classList.add("show");
          setTimeout(() => overlay.classList.remove("show"), 2000);
        }, 500);
      })
      .catch((error) => {
        showLoading(false);
        showNotification("Error: " + error.message, "error");
        console.error("Detection error:", error);
      });
  }

  function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress >= 90) {
        clearInterval(interval);
        return;
      }
      progress += Math.random() * 10;
      progress = Math.min(progress, 90);
      updateProgress(progress);
    }, 200);
  }

  function updateProgress(percent) {
    progressFill.style.width = percent + "%";
    const messages = [
      "Initializing algorithm...",
      "Processing image data...",
      "Applying edge detection...",
      "Optimizing results...",
      "Finalizing output...",
    ];
    const messageIndex = Math.floor((percent / 100) * messages.length);
    progressText.textContent =
      messages[Math.min(messageIndex, messages.length - 1)];
  }

  function resetApp() {
    fileInput.value = "";
    originalImage.src = "#";
    originalImageResult.src = "#";
    processedImage.src = "#";
    detectBtn.disabled = true;
    imagePreview.style.display = "none";
    resultsSection.style.display = "none";
    currentFile = null;
    processedImageUrl = null;
    thresholdSlider.value = 5;
    updateThresholdValue();
    document.querySelector("#canny").checked = true;
    updateAlgorithmSelection();

    // Reset preset buttons
    presetButtons.forEach((btn) => btn.classList.remove("active"));
    document
      .querySelector('.preset-btn[data-value="5"]')
      .classList.add("active");

    showNotification("Application reset", "info");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function downloadImage() {
    if (!processedImageUrl) {
      showNotification("No processed image to download", "error");
      return;
    }

    const algorithm = document.querySelector(
      'input[name="algorithm"]:checked'
    ).value;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `edge-detection-${algorithm}-${timestamp}.png`;

    const a = document.createElement("a");
    a.href = processedImageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showNotification("Image downloaded successfully!", "success");
  }

  function showLoading(show) {
    if (show) {
      loadingOverlay.style.display = "flex";
      detectBtn.classList.add("loading");
    } else {
      loadingOverlay.style.display = "none";
      detectBtn.classList.remove("loading");
    }
  }

  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.classList.remove("show");
    }, 5000);

    // Manual close on click
    notification.addEventListener("click", () => {
      notification.classList.remove("show");
    });
  }

  // Add some interactive effects
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)";
    });

    btn.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "o":
          e.preventDefault();
          fileInput.click();
          break;
        case "r":
          e.preventDefault();
          resetApp();
          break;
        case "Enter":
          if (!detectBtn.disabled) {
            e.preventDefault();
            detectEdges();
          }
          break;
      }
    }
  });

  console.log("EdgeVision initialized successfully! ");
});
