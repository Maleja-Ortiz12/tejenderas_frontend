import { Jimp } from 'jimp';

async function checkDimensions(imagePath) {
    try {
        const image = await Jimp.read(imagePath);
        console.log(`Dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
    } catch (err) {
        console.error("Error:", err);
    }
}

checkDimensions('public/logo_original.png');
