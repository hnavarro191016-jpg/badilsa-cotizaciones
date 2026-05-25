import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { XMLParser } from 'fast-xml-parser';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const diasCreditoStr = formData.get('diasCredito') as string;
    const diasCredito = parseInt(diasCreditoStr) || 30;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const xmlData = await file.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const jsonObj = parser.parse(xmlData);

    // Navegar el XML del SAT
    const comprobante = jsonObj['cfdi:Comprobante'];
    if (!comprobante) {
      return NextResponse.json({ error: 'El archivo no es un XML de CFDI válido' }, { status: 400 });
    }

    const emisor = comprobante['cfdi:Emisor'];
    const receptor = comprobante['cfdi:Receptor'];
    const complemento = comprobante['cfdi:Complemento'];
    const timbre = complemento ? complemento['tfd:TimbreFiscalDigital'] : null;

    if (!timbre || !timbre['@_UUID']) {
        return NextResponse.json({ error: 'No se encontró el UUID fiscal en el XML' }, { status: 400 });
    }

    const uuid = timbre['@_UUID'];
    
    // Verificar si ya existe
    const existingFactura = await prisma.factura.findUnique({ where: { uuid } });
    if (existingFactura) {
      return NextResponse.json({ error: 'Esta factura ya fue subida al sistema' }, { status: 409 });
    }

    const fechaEmisionStr = comprobante['@_Fecha']; 
    const fechaEmision = new Date(fechaEmisionStr);
    
    // Calcular fecha vencimiento
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasCredito);

    const subTotal = parseFloat(comprobante['@_SubTotal']);
    const total = parseFloat(comprobante['@_Total']);
    const moneda = comprobante['@_Moneda'] || 'MXN';
    
    const ivaItem = comprobante['cfdi:Impuestos']?.['cfdi:Traslados']?.['cfdi:Traslado'];
    let iva = 0;
    if (Array.isArray(ivaItem)) {
        ivaItem.forEach((i: any) => { if(i['@_Impuesto'] === '002') iva += parseFloat(i['@_Importe']) });
    } else if (ivaItem && ivaItem['@_Impuesto'] === '002') {
        iva = parseFloat(ivaItem['@_Importe']);
    }

    const factura = await prisma.factura.create({
      data: {
        uuid,
        emisorRfc: emisor['@_Rfc'],
        emisorNombre: emisor['@_Nombre'] || emisor['@_Rfc'],
        receptorRfc: receptor['@_Rfc'],
        receptorNombre: receptor['@_Nombre'] || receptor['@_Rfc'],
        fechaEmision,
        fechaVencimiento,
        moneda,
        subTotal,
        iva,
        total,
        diasCredito,
        xmlData: xmlData,
      }
    });

    return NextResponse.json(factura);

  } catch (error) {
    console.error('Error procesando XML:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el archivo XML. Asegúrate de que es un CFDI válido del SAT.' },
      { status: 500 }
    );
  }
}
