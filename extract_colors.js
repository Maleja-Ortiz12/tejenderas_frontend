import { Jimp } from 'jimp';

async function getDominantColors(imagePath) {
    try {
        const image = await Jimp.read(imagePath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        const colorCounts = {};

        image.scan(0, 0, width, height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        });

        // Sort by frequency
        const sortedColors = Object.entries(colorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([color]) => color);

        console.log("Dominant Colors:", sortedColors);
    } catch (err) {
        console.error("Error:", err);
    }
}

getDominantColors('public/logo_original.png');
