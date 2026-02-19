from PIL import Image
from collections import Counter

def get_dominant_colors(image_path, num_colors=5):
    try:
        image = Image.open(image_path)
        image = image.convert('RGB')
        image = image.resize((150, 150))      # Resize for speed
        pixels = list(image.getdata())
        counts = Counter(pixels)
        dominant = counts.most_common(num_colors)
        
        print("Dominant Colors:")
        for color, count in dominant:
            hex_color = '#{:02x}{:02x}{:02x}'.format(*color)
            print(f"{hex_color}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_dominant_colors('public/logo.png')
