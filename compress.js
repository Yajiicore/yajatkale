import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// CONFIGURATION
const inputDir = 'public/frames';           // Where your 4K images are
const outputDir = 'public/frames_optimized'; // Where the new images will go
const targetWidth = 1920;                   // Resize 4K -> 1080p (Massive savings)
const quality = 80;                         // 80% WebP quality (High fidelity)

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function processImages() {
    try {
        const files = fs.readdirSync(inputDir);

        // Filter only image files
        const images = files.filter(file =>
            /\.(webp|png|jpg|jpeg)$/i.test(file)
        );

        console.log(`🚀 Starting compression for ${images.length} images...`);
        console.log(`📉 Target: ${targetWidth}px width, ${quality}% quality`);

        let count = 0;

        for (const file of images) {
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, file);

            await sharp(inputPath)
                .resize({ width: targetWidth }) // Resize maintains aspect ratio
                .webp({ quality: quality })     // Smart compression
                .toFile(outputPath);

            count++;
            if (count % 10 === 0) process.stdout.write('.'); // Progress dots
        }

        console.log(`\n\n✅ Done! Processed ${count} images.`);
        console.log(`📂 Check the '${outputDir}' folder.`);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

processImages();
