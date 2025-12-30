/**
 * Script para optimizar imágenes del sitio Meranti
 * Ejecutar con: node optimize-images.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, 'images');

// Configuración de imágenes a optimizar
const imagesToOptimize = [
    {
        source: 'about-img-wrapper-main.webp',
        outputs: [
            { suffix: '', width: 388, quality: 80 },      // Tamaño mostrado en la página
            { suffix: '-2x', width: 776, quality: 75 },   // Para pantallas retina
        ]
    },
    {
        source: 'about-img-wrapper-secondary.webp',
        outputs: [
            { suffix: '', width: 388, quality: 80 },      // Tamaño mostrado en la página
            { suffix: '-2x', width: 776, quality: 75 },   // Para pantallas retina
        ]
    },
    {
        source: 'fav_icon.webp',
        outputs: [
            { suffix: '', width: 230, quality: 80 },      // Tamaño mostrado en preloader
            { suffix: '-2x', width: 460, quality: 75 },   // Para pantallas retina
        ]
    },
    {
        source: 'fondo_hero.webp',
        outputs: [
            { suffix: '-mobile', width: 768, quality: 75 },
            { suffix: '-tablet', width: 1024, quality: 75 },
            { suffix: '', width: 1920, quality: 70 },
        ]
    }
];

async function optimizeImages() {
    console.log('🖼️  Iniciando optimización de imágenes...\n');

    for (const image of imagesToOptimize) {
        const sourcePath = path.join(imagesDir, image.source);

        // Verificar si el archivo fuente existe
        if (!fs.existsSync(sourcePath)) {
            console.log(`⚠️  Archivo no encontrado: ${image.source}`);
            continue;
        }

        const baseName = path.basename(image.source, '.webp');

        for (const output of image.outputs) {
            const outputName = `${baseName}${output.suffix}-optimized.webp`;
            const outputPath = path.join(imagesDir, outputName);

            try {
                const info = await sharp(sourcePath)
                    .resize(output.width, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ quality: output.quality })
                    .toFile(outputPath);

                const originalSize = fs.statSync(sourcePath).size;
                const newSize = info.size;
                const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

                console.log(`✅ ${outputName}`);
                console.log(`   Tamaño: ${(newSize / 1024).toFixed(1)} KB (${savings}% de ahorro)`);
                console.log(`   Dimensiones: ${info.width}x${info.height}\n`);
            } catch (error) {
                console.error(`❌ Error procesando ${outputName}: ${error.message}`);
            }
        }
    }

    console.log('🎉 ¡Optimización completada!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Revisa las imágenes optimizadas en la carpeta images/');
    console.log('2. Renombra las imágenes optimizadas removiendo "-optimized" del nombre');
    console.log('3. O actualiza las referencias en index.html para usar los nuevos nombres\n');
}

optimizeImages().catch(console.error);
