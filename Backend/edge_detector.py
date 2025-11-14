import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

class EdgeDetector:
    def __init__(self):
        self.supported_algorithms = ['canny', 'sobel', 'laplacian']
    def process_image(self, image, algorithm='canny', sensitivity=5):
        """
        Main method to process image with specified algorithm
        
        Args:
            image: Input image as numpy array (BGR format)
            algorithm: Edge detection algorithm ('canny', 'sobel', 'laplacian')
            sensitivity: Sensitivity level (1-10)
        
        Returns:
            Processed image as numpy array (BGR format with black background and white edges)
        """
        if algorithm not in self.supported_algorithms:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        # Convert to grayscale for edge detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply selected algorithm
        if algorithm == 'canny':
            edges = self._apply_canny(gray, sensitivity)
        elif algorithm == 'sobel':
            edges = self._apply_sobel(gray, sensitivity)
        elif algorithm == 'laplacian':
            edges = self._apply_laplacian(gray, sensitivity)
        
        # Convert binary edges to BGR format (white edges on black background)
        result = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        
        return result
    
    def _apply_canny(self, gray_image, sensitivity):
        """
        Apply Canny edge detection algorithm
        
        Args:
            gray_image: Grayscale input image
            sensitivity: Sensitivity level (1-10)
        
        Returns:
            Binary edge image
        """
        try:
            # Calculate adaptive thresholds based on image statistics and sensitivity
            sigma = 0.33
            median = np.median(gray_image)
            lower = int(max(0, (1.0 - sigma) * median * (sensitivity / 10)))
            upper = int(min(255, (1.0 + sigma) * median * (sensitivity / 5)))
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray_image, (5, 5), 1.4)
            
            # Apply Canny edge detection
            edges = cv2.Canny(blurred, lower, upper, L2gradient=True)
            
            logger.info(f"Canny edges detected with thresholds: {lower}, {upper}")
            
            return edges
            
        except Exception as e:
            logger.error(f"Error in Canny edge detection: {str(e)}")
            raise
    
    def _apply_sobel(self, gray_image, sensitivity):
        """
        Apply Sobel edge detection algorithm
        
        Args:
            gray_image: Grayscale input image
            sensitivity: Sensitivity level (1-10)
        
        Returns:
            Binary edge image
        """
        try:
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray_image, (3, 3), 0)
            
            # Calculate Sobel gradients in X and Y directions
            sobel_x = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=3)
            sobel_y = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=3)
            
            # Calculate gradient magnitude
            gradient_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
            
            # Normalize to 0-255
            gradient_magnitude = np.uint8(255 * gradient_magnitude / np.max(gradient_magnitude))
            
            # Apply adaptive threshold based on sensitivity
            # Higher sensitivity = lower threshold = more edges detected
            threshold_value = max(10, 100 - (sensitivity * 8))
            _, edges = cv2.threshold(gradient_magnitude, threshold_value, 255, cv2.THRESH_BINARY)
            
            logger.info(f"Sobel edges detected with threshold: {threshold_value}")
            
            return edges
            
        except Exception as e:
            logger.error(f"Error in Sobel edge detection: {str(e)}")
            raise
    
    def _apply_laplacian(self, gray_image, sensitivity):
        """
        Apply Laplacian of Gaussian edge detection
        
        Args:
            gray_image: Grayscale input image
            sensitivity: Sensitivity level (1-10)
        
        Returns:
            Binary edge image
        """
        try:
            # Apply Gaussian blur first (Laplacian of Gaussian)
            # Kernel size increases with sensitivity to capture more details
            kernel_size = 3 + (sensitivity // 3) * 2  # 3, 5, or 7
            blurred = cv2.GaussianBlur(gray_image, (kernel_size, kernel_size), 2.0)
            
            # Apply Laplacian operator
            laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
            
            # Take absolute value and convert to 8-bit
            laplacian_abs = np.uint8(np.absolute(laplacian))
            
            # Apply adaptive threshold based on sensitivity
            # Higher sensitivity = lower threshold = more edges detected
            threshold_value = max(5, 50 - (sensitivity * 4))
            _, edges = cv2.threshold(laplacian_abs, threshold_value, 255, cv2.THRESH_BINARY)
            
            logger.info(f"Laplacian edges detected with kernel size: {kernel_size}, threshold: {threshold_value}")
            
            return edges
            
        except Exception as e:
            logger.error(f"Error in Laplacian edge detection: {str(e)}")
            raise
    
    def compare_algorithms(self, image, sensitivity=5):
        """
        Apply all three algorithms to the same image for comparison
        
        Args:
            image: Input image
            sensitivity: Sensitivity level (1-10)
        
        Returns:
            Dictionary with results from all algorithms
        """
        results = {}
        
        for algorithm in self.supported_algorithms:
            edges = self.process_image(image, algorithm, sensitivity)
            results[algorithm] = edges
        
        return results