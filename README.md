# ASCII图片转换器

这是一个基于Web的图片转ASCII字符工具，能够将上传的图片转换为ASCII字符作品。

## 功能特点

- 图片上传和预览
- 实时ASCII字符转换
- 可调节对比度和亮度
- 支持拖拽上传
- 现代化的用户界面
- 使用Python后端处理图像

## 技术栈

- 前端：HTML, JavaScript, Tailwind CSS
- 后端：Flask, OpenCV (Python)
- 图像处理：Python-OpenCV
- 依赖管理：Conda

## 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/superymr/ascii-art.git
cd [项目目录]
```

2. 创建并激活Conda环境：
```bash
conda env create -f environment.yml
conda activate ascii-art
```

3. 安装Python依赖：
```bash
pip install -r requirements.txt
```

## 运行应用

1. 启动Flask服务器：
```bash
python app.py
```

2. 在浏览器中访问：
```
http://localhost:5000
```

## 使用说明

1. 点击"选择图片"按钮或将图片拖拽到指定区域
2. 等待图片预览加载完成
3. 使用滑块调节图片的对比度和亮度（可选）
4. ASCII字符识别将自动生成并显示
5. 可以随时调整参数，实时查看效果

## 注意事项

- 建议上传的图片分辨率不要太大，以获得最佳转换效果
- 支持常见的图片格式：JPG, PNG, GIF等
- 转换过程可能需要几秒钟，请耐心等待

## 依赖版本

主要依赖包版本要求：
- Flask>=2.0.0
- opencv-python>=4.5.0
- Pillow>=8.0.0
- numpy>=1.19.0

## 许可证

MIT License

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目。 
