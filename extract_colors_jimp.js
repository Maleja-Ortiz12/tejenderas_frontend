
import { Jimp } from 'jimp';
import { resolve } from 'path';

async function getDominantColors(imagePath) {
    try {
        const image = await Jimp.read(imagePath);
        image.resize({ w: 150, h: 150 });

        const colorCounts = {};
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const hex = image.getPixelColor(x, y);
                const r = (hex >> 24) & 0xFF;
                const g = (hex >> 16) & 0xFF;
                const b = (hex >> 8) & 0xFF;
                const a = hex & 0xFF;

                // Ignore transparent or near-transparent pixels
                if (a > 10) {
                    const key = `${r},${g},${b}`;
                    colorCounts[key] = (colorCounts[key] || 0) + 1;
                }
            }
        }

        const sortedColors = Object.entries(colorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([color]) => {
                const [r, g, b] = color.split(',').map(Number);
                const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                return `rgb(${r}, ${g}, ${b}) -> ${hex}`;
            });

        console.log("Dominant Colors:");
        sortedColors.forEach(c => console.log(c));

    } catch (err) {
        console.error("Error:", err);
    }
}

getDominantColors(resolve('public/logo.png'));
