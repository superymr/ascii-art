// 使用更丰富的ASCII字符集，按照视觉密度从高到低排序
const ASCII_CHARS = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';

let lastUploadedImage = null;

function handleImageUpload(e) {
    console.log('File upload triggered');
    const file = e.target.files[0];
    if (file) {
        console.log('File selected:', file.name, 'Size:', file.size);
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            console.log('File read complete');
            const img = new Image();
            img.onload = function() {
                console.log('Image loaded:', img.width, 'x', img.height);
                document.getElementById('preview').src = event.target.result;
                document.getElementById('preview').style.display = 'block';
                lastUploadedImage = event.target.result;
                processImage();
            };
            img.onerror = function(error) {
                console.error('Image load error:', error);
                alert('图片加载失败，请重试！');
            };
            img.src = event.target.result;
        };
        reader.onerror = function(error) {
            console.error('File read error:', error);
            alert('文件读取失败，请重试！');
        };
        reader.readAsDataURL(file);
    }
}

function handleImageAdjustment() {
    if (lastUploadedImage) {
        processImage();
    } else {
        console.log('No image loaded yet');
    }
}

async function processImage() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    try {
        const contrast = parseFloat(document.getElementById('contrast').value);
        const brightness = parseFloat(document.getElementById('brightness').value);
        const charWidth = parseInt(document.getElementById('charWidth').value);
        
        console.log('Processing image with contrast:', contrast, 'brightness:', brightness, 'charWidth:', charWidth);
        
        const response = await fetch('/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: lastUploadedImage,
                contrast: contrast,
                brightness: brightness,
                charWidth: charWidth
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        console.log('Image processing complete');
        document.getElementById('asciiArt').textContent = data.ascii;
    } catch (error) {
        console.error('Error processing image:', error);
        alert('处理图像时出错：' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// 基本的图像处理方法（不使用OpenCV）
function fallbackProcessing(img) {
    const canvas = document.createElement('canvas');
    const maxWidth = 150;
    const ratio = img.height / img.width;
    const width = maxWidth;
    const height = Math.floor(maxWidth * ratio * 0.5);
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let asciiArt = '';
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const idx = (i * width + j) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
            const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
            asciiArt += ASCII_CHARS[charIndex];
        }
        asciiArt += '\n';
    }
    
    document.getElementById('asciiArt').textContent = asciiArt;
}

// 修改初始化逻辑
window.addEventListener('load', function() {
    // 不再禁用上传按钮
    document.getElementById('imageInput').disabled = false;
    
    // 创建自定义标签来显示"选择文件"
    const customLabel = document.createElement('label');
    customLabel.htmlFor = 'imageInput';
    customLabel.className = 'custom-file-input';
    customLabel.textContent = '选择文件';
    
    // 修改原始input的样式
    document.getElementById('imageInput').style.opacity = '0';
    document.getElementById('imageInput').style.position = 'absolute';
    document.getElementById('imageInput').style.zIndex = '-1';
    
    // 在原始input前插入自定义标签
    document.getElementById('imageInput').parentNode.insertBefore(customLabel, document.getElementById('imageInput'));
    
    // 更新自定义标签的文字
    document.getElementById('imageInput').addEventListener('change', function() {
        if (this.files.length > 0) {
            customLabel.textContent = this.files[0].name;
        } else {
            customLabel.textContent = '选择文件';
        }
    });
});

document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('contrast').addEventListener('input', handleImageAdjustment);
document.getElementById('brightness').addEventListener('input', handleImageAdjustment);

// 添加字符宽度滑块值更新
document.getElementById('charWidth').addEventListener('input', function(e) {
    document.getElementById('charWidthValue').textContent = e.target.value;
    handleImageAdjustment();
});

// 添加复制功能
document.getElementById('copyButton').addEventListener('click', async function() {
    const asciiArt = document.getElementById('asciiArt').textContent;
    try {
        await navigator.clipboard.writeText(asciiArt);
        const originalText = this.textContent;
        this.textContent = '已复制！';
        setTimeout(() => {
            this.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    }
}); 