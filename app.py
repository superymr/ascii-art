from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import base64
from PIL import Image
import io
import os
import logging

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_url_path='')
CORS(app)

# ASCII字符集，按照视觉密度从高到低排序
ASCII_CHARS = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '

def process_image(image_data, contrast=1.0, brightness=0, char_width=150):
    try:
        logger.debug(f"Processing image with contrast={contrast}, brightness={brightness}, char_width={char_width}")
        
        # 检查图像数据格式
        if ',' not in image_data:
            raise ValueError("Invalid image data format")
            
        # 将base64图像数据转换为OpenCV格式
        image_data = image_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
            
        logger.debug(f"Original image size: {img.shape}")
        
        # 调整图像大小
        height, width = img.shape[:2]
        new_width = char_width
        ratio = height / width
        new_height = int(char_width * ratio * 0.5)
        img = cv2.resize(img, (new_width, new_height))
        logger.debug(f"Resized image size: {img.shape}")
        
        # 转换为灰度图
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 应用对比度和亮度调整
        adjusted = cv2.convertScaleAbs(gray, alpha=float(contrast), beta=float(brightness))
        
        # 应用自适应阈值处理
        thresh = cv2.adaptiveThreshold(adjusted, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                     cv2.THRESH_BINARY, 3, 2)
        
        # 混合原始灰度图和边缘增强图
        result = cv2.addWeighted(adjusted, 0.7, thresh, 0.3, 0)
        
        # 转换为ASCII艺术
        ascii_art = []
        for row in result:
            line = ''
            for pixel in row:
                index = int((pixel / 255) * (len(ASCII_CHARS) - 1))
                line += ASCII_CHARS[index]
            ascii_art.append(line)
        
        logger.debug("Image processing completed successfully")
        return '\n'.join(ascii_art)
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise

@app.route('/')
def serve_static():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js')

@app.route('/convert', methods=['POST'])
def convert_image():
    try:
        logger.debug("Received image conversion request")
        data = request.json
        if not data:
            raise ValueError("No JSON data received")
            
        image_data = data.get('image')
        if not image_data:
            raise ValueError("No image data provided")
            
        contrast = float(data.get('contrast', 1.0))
        brightness = float(data.get('brightness', 0))
        char_width = int(data.get('charWidth', 150))
        
        logger.debug(f"Processing request with contrast={contrast}, brightness={brightness}, char_width={char_width}")
        
        ascii_result = process_image(image_data, contrast, brightness, char_width)
        return jsonify({'ascii': ascii_result})
    except Exception as e:
        logger.error(f"Error in convert_image: {str(e)}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000) 