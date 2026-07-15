import base64
import re
from PIL import Image
import io

with open('assets/images/yeni-logo.svg', 'r', encoding='utf-8') as f:
    svg_data = f.read()

match = re.search(r'href="data:image/png;base64,([^"]+)"', svg_data)
if match:
    b64_str = match.group(1)
    img_data = base64.b64decode(b64_str)
    img = Image.open(io.BytesIO(img_data))
    img = img.convert('RGBA')
    bbox = img.getbbox()
    
    print(f"Original Image Size: {img.size}")
    print(f"Bounding Box (left, upper, right, lower): {bbox}")
    
    if bbox:
        visible_width = bbox[2] - bbox[0]
        visible_height = bbox[3] - bbox[1]
        print(f"Visible Width: {visible_width}, Visible Height: {visible_height}")
        
        width_pct = visible_width / img.size[0]
        height_pct = visible_height / img.size[1]
        print(f"Visible width is {width_pct:.2%} of total width")
        print(f"Visible height is {height_pct:.2%} of total height")
else:
    print("Base64 image not found in SVG.")
