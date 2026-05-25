const PptxGenJS = require('pptxgenjs');

let pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';

const CORPORATE_BLUE = '003366';
const ACCENT_BLUE = '005b96';
const LIGHT_BG = 'F4F6F9';

// Define Master Slide
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: LIGHT_BG },
  objects: [
    // Top Bar
    { rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: CORPORATE_BLUE } } },
    // Small Logo in Top Right
    { image: { path: 'C:/ProyectoBadilsa/public/logo.png', x: 8.5, y: 0.1, w: 1.2, h: 0.6, sizing: { type: 'contain' } } },
    // Bottom Bar
    { rect: { x: 0, y: 7.0, w: '100%', h: 0.5, fill: { color: CORPORATE_BLUE } } },
    { text: { text: 'Badilsa - Maquinados de Piezas Industriales', options: { x: 0.5, y: 7.1, w: 6, h: 0.3, color: 'FFFFFF', fontSize: 10, fontFace: 'Helvetica' } } },
    { text: { text: 'ventas@badilsa.com | (01.81) 83.14.27.67', options: { x: 7, y: 7.1, w: 3, h: 0.3, color: 'FFFFFF', fontSize: 10, align: 'right', fontFace: 'Helvetica' } } }
  ]
});

// SLIDE 1: Title (Custom layout)
let slide1 = pptx.addSlide();
slide1.background = { color: 'FFFFFF' };
// Diagonal/Accent Shape
slide1.addShape(pptx.ShapeType.rtTriangle, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: LIGHT_BG }, flipH: true });
slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 5.5, w: '100%', h: 2.0, fill: { color: CORPORATE_BLUE } });

// Main Logo
slide1.addImage({ path: 'C:/ProyectoBadilsa/public/logo.png', x: 2.5, y: 1.5, w: 5, h: 2.5, sizing: { type: 'contain' } });
slide1.addText('PRESENTACIÓN EJECUTIVA', { x: 0, y: 4.2, w: '100%', h: 1, fontSize: 32, bold: true, color: CORPORATE_BLUE, align: 'center', fontFace: 'Helvetica', letterSpacing: 2 });
slide1.addText('Líderes en Maquinados Industriales\nApodaca, Nuevo León', { x: 0, y: 6.0, w: '100%', h: 1, fontSize: 22, color: 'FFFFFF', align: 'center', fontFace: 'Helvetica' });


// SLIDE 2: Quiénes Somos
let slide2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide2.addText('QUIÉNES SOMOS', { x: 0.5, y: 0.1, w: 5, h: 0.6, color: 'FFFFFF', fontSize: 24, bold: true, fontFace: 'Helvetica' });
slide2.addText('MÁS DE 40 AÑOS DE EXPERIENCIA', { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 20, bold: true, color: ACCENT_BLUE, fontFace: 'Helvetica' });
slide2.addText([
    { text: 'Badilsa es una empresa fundada en 2001, especializada en proporcionar soluciones de alta precisión y calidad para la industria Metal-Mecánica.\n\n' },
    { text: 'INFRAESTRUCTURA DE ALTO NIVEL\n', options: { bold: true, color: CORPORATE_BLUE } },
    { text: '• Más de 1,200 m² de piso de producción.\n' },
    { text: '• Un equipo consolidado de ingenieros y técnicos altamente especializados en mecanizados complejos.' }
], { x: 0.5, y: 1.8, w: 9, h: 4, fontSize: 18, color: '333333', fontFace: 'Helvetica', bullet: false });


// SLIDE 3: Capacidades
let slide3 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide3.addText('CAPACIDADES Y MAQUINARIA', { x: 0.5, y: 0.1, w: 8, h: 0.6, color: 'FFFFFF', fontSize: 24, bold: true, fontFace: 'Helvetica' });

// Two columns
slide3.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.2, w: 4.2, h: 5.0, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
slide3.addText('TECNOLOGÍA DE PUNTA', { x: 0.7, y: 1.5, w: 3.8, h: 0.5, fontSize: 18, bold: true, color: ACCENT_BLUE, fontFace: 'Helvetica' });
slide3.addText('• Centros de Maquinado CNC\n• Tornos CNC\n• Tornos convencionales\n• Fresadoras\n• Rectificadoras\n• Soldadura y Pailería Ligera', { x: 0.7, y: 2.2, w: 3.8, h: 3.5, fontSize: 16, color: '333333', fontFace: 'Helvetica' });

slide3.addShape(pptx.ShapeType.rect, { x: 5.3, y: 1.2, w: 4.2, h: 5.0, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
slide3.addText('CALIDAD Y DISEÑO', { x: 5.5, y: 1.5, w: 3.8, h: 0.5, fontSize: 18, bold: true, color: ACCENT_BLUE, fontFace: 'Helvetica' });
slide3.addText('• Escaneado de piezas\n• Análisis dimensionales rigurosos\n• Programación y diseño CAD/CAM\n• Soluciones personalizadas\n• Metales, aleaciones y plásticos de ingeniería', { x: 5.5, y: 2.2, w: 3.8, h: 3.5, fontSize: 16, color: '333333', fontFace: 'Helvetica' });


// SLIDE 4: Clientes (With Logos)
let slide4 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide4.addText('SOCIOS COMERCIALES Y CLIENTES CLAVE', { x: 0.5, y: 0.1, w: 8, h: 0.6, color: 'FFFFFF', fontSize: 24, bold: true, fontFace: 'Helvetica' });
slide4.addText('Atendemos a los sectores Automotriz, Alimenticio, Electrónico, Manufactura y Minería.', { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, color: '555555', fontFace: 'Helvetica' });

// Add Logos using public URL (Clearbit API)
// Stanley
slide4.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.0, w: 2.5, h: 2.0, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
slide4.addImage({ path: 'https://icon.horse/icon/stanleyblackanddecker.com', x: 0.75, y: 2.25, w: 2.0, h: 1.5, sizing: { type: 'contain' } });
slide4.addText('Stanley Black&Decker', { x: 0.5, y: 4.1, w: 2.5, h: 0.3, fontSize: 12, bold: true, color: '333333', align: 'center', fontFace: 'Helvetica' });

// Panasonic
slide4.addShape(pptx.ShapeType.rect, { x: 3.5, y: 2.0, w: 2.5, h: 2.0, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
slide4.addImage({ path: 'https://icon.horse/icon/panasonic.com', x: 3.75, y: 2.25, w: 2.0, h: 1.5, sizing: { type: 'contain' } });
slide4.addText('PANASONIC', { x: 3.5, y: 4.1, w: 2.5, h: 0.3, fontSize: 12, bold: true, color: '333333', align: 'center', fontFace: 'Helvetica' });

// Kontoor
slide4.addShape(pptx.ShapeType.rect, { x: 6.5, y: 2.0, w: 2.5, h: 2.0, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
slide4.addImage({ path: 'https://icon.horse/icon/kontoorbrands.com', x: 6.75, y: 2.25, w: 2.0, h: 1.5, sizing: { type: 'contain' } });
slide4.addText('Kontoor', { x: 6.5, y: 4.1, w: 2.5, h: 0.3, fontSize: 12, bold: true, color: '333333', align: 'center', fontFace: 'Helvetica' });

// INOAC
slide4.addShape(pptx.ShapeType.rect, { x: 2.0, y: 4.6, w: 2.5, h: 1.8, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
slide4.addImage({ path: 'https://icon.horse/icon/inoac.co.jp', x: 2.25, y: 4.75, w: 2.0, h: 1.5, sizing: { type: 'contain' } });

// NIDEC
slide4.addShape(pptx.ShapeType.rect, { x: 5.0, y: 4.6, w: 2.5, h: 1.8, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
slide4.addImage({ path: 'https://icon.horse/icon/nidec.com', x: 5.25, y: 4.75, w: 2.0, h: 1.5, sizing: { type: 'contain' } });


// SLIDE 5: Piezas Muestra
let slide5 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide5.addText('CAPACIDAD DEMOSTRADA (PIEZAS MUESTRA)', { x: 0.5, y: 0.1, w: 8, h: 0.6, color: 'FFFFFF', fontSize: 24, bold: true, fontFace: 'Helvetica' });

slide5.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 1.0, fill: { color: 'FFFFFF' }, line: { color: ACCENT_BLUE, width: 2 } });
slide5.addText('Fixture Eva 160ml', { x: 0.7, y: 1.6, w: 3, h: 0.8, fontSize: 18, bold: true, color: CORPORATE_BLUE, fontFace: 'Helvetica' });
slide5.addText('Diseño y mecanizado para máquina 6-Pass Mat en Aluminio, incluyendo desarrollo y piezas de prueba.', { x: 4.0, y: 1.6, w: 5.3, h: 0.8, fontSize: 14, color: '555555', fontFace: 'Helvetica' });

slide5.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.8, w: 9, h: 1.0, fill: { color: 'FFFFFF' }, line: { color: ACCENT_BLUE, width: 2 } });
slide5.addText('Componentes Especiales', { x: 0.7, y: 2.9, w: 3, h: 0.8, fontSize: 18, bold: true, color: CORPORATE_BLUE, fontFace: 'Helvetica' });
slide5.addText('Fabricación de Ayudante para Candados (Ayop130 Z01 / Ljok-01) con estrictas tolerancias.', { x: 4.0, y: 2.9, w: 5.3, h: 0.8, fontSize: 14, color: '555555', fontFace: 'Helvetica' });

slide5.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.1, w: 9, h: 1.0, fill: { color: 'FFFFFF' }, line: { color: ACCENT_BLUE, width: 2 } });
slide5.addText('Sistemas Complejos', { x: 0.7, y: 4.2, w: 3, h: 0.8, fontSize: 18, bold: true, color: CORPORATE_BLUE, fontFace: 'Helvetica' });
slide5.addText('Perfiles personalizados A-B-C-D e ingeniería de ensambles como Meiaasbu 05-00-02.', { x: 4.0, y: 4.2, w: 5.3, h: 0.8, fontSize: 14, color: '555555', fontFace: 'Helvetica' });


// SLIDE 6: Métricas
let slide6 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide6.addText('RENDIMIENTO Y SOLIDEZ COMERCIAL', { x: 0.5, y: 0.1, w: 9, h: 0.6, color: 'FFFFFF', fontSize: 24, bold: true, fontFace: 'Helvetica' });
slide6.addText('Operamos con agilidad y volumen. Nuestras métricas actuales de Pipeline demuestran nuestra capacidad de respuesta al mercado:', { x: 0.5, y: 1.2, w: 9, h: 1, fontSize: 16, color: '555555', fontFace: 'Helvetica' });

// 3 Metric Cards
slide6.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.5, w: 2.8, h: 3.0, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, shadow: { type: 'outer', color: '000000', opacity: 0.1, blur: 5 } });
slide6.addText('PIPELINE ACTIVO\n(Cotizado)', { x: 0.5, y: 2.8, w: 2.8, h: 1, fontSize: 16, bold: true, color: '333333', align: 'center', fontFace: 'Helvetica' });
slide6.addText('>$2.1 MDP', { x: 0.5, y: 3.8, w: 2.8, h: 1, fontSize: 32, bold: true, color: ACCENT_BLUE, align: 'center', fontFace: 'Helvetica' });

slide6.addShape(pptx.ShapeType.rect, { x: 3.6, y: 2.5, w: 2.8, h: 3.0, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, shadow: { type: 'outer', color: '000000', opacity: 0.1, blur: 5 } });
slide6.addText('COTIZACIONES\nEN PROCESO', { x: 3.6, y: 2.8, w: 2.8, h: 1, fontSize: 16, bold: true, color: '333333', align: 'center', fontFace: 'Helvetica' });
slide6.addText('31', { x: 3.6, y: 3.8, w: 2.8, h: 1, fontSize: 40, bold: true, color: ACCENT_BLUE, align: 'center', fontFace: 'Helvetica' });

slide6.addShape(pptx.ShapeType.rect, { x: 6.7, y: 2.5, w: 2.8, h: 3.0, fill: { color: CORPORATE_BLUE }, shadow: { type: 'outer', color: '000000', opacity: 0.15, blur: 8 } });
slide6.addText('CONVERSIÓN A\nORDEN DE COMPRA', { x: 6.7, y: 2.8, w: 2.8, h: 1, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Helvetica' });
slide6.addText('16.1%', { x: 6.7, y: 3.8, w: 2.8, h: 1, fontSize: 40, bold: true, color: '10b981', align: 'center', fontFace: 'Helvetica' }); // Green color for success


// Save
pptx.writeFile({ fileName: 'C:/Users/hnava/OneDrive/Desktop/Presentacion_Badilsa.pptx' })
  .then(() => { console.log('PPTX Created Successfully!'); })
  .catch((err) => { console.error('Error:', err); });
