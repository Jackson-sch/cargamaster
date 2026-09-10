import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";

export interface CartaDePortePdfProps {
  empresa: {
    razonSocial: string;
    ruc: string;
    direccionFiscal: string;
    telefono?: string | null;
    email?: string | null;
    bancoNacionCuenta?: string | null;
  };
  orden: any;
  qrCodeUrl: string;
}

export function CartaDePortePDF({
  empresa,
  orden,
  qrCodeUrl,
}: CartaDePortePdfProps) {
  const fechaEmision = new Date().toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const fleteTotal = parseFloat(String(orden.fletePactadoMonto || "4500.00"));
  const tasaDetraccion = 0.04;
  const montoDetraccion = fleteTotal * tasaDetraccion;
  const montoNeto = fleteTotal - montoDetraccion;
  const monedaSimbolo = (orden.fletePactadoMoneda || orden.moneda) === "USD" ? "US$" : "S/";

  const facturaVinculada = orden.comprobantes?.[0]
    ? `${orden.comprobantes[0].serie}-${String(orden.comprobantes[0].numeroCorrelativo).padStart(6, "0")}`
    : "F001-000089";

  const pesoEnTn = orden.pesoBrutoKg
    ? (parseFloat(String(orden.pesoBrutoKg)) / 1000).toFixed(2)
    : "29.50";

  const esMatpel = orden.tipoCarga === "matpel";

  return (
    <Document title={`Carta_de_Porte_${orden.codigoViaje}.pdf`} author="CargaMaster Pro">
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.headerContainer}>
          <View style={styles.companyBox}>
            <Text style={styles.companyName}>{empresa.razonSocial}</Text>
            <Text style={styles.companySub}>RUC N° {empresa.ruc} · EMPRESA DE TRANSPORTE DE CARGA PESADA</Text>
            <Text style={styles.companySub}>{empresa.direccionFiscal}</Text>
            <Text style={styles.companySub}>
              Cta. Cte. Banco de la Nación (Detracción SPOT): {empresa.bancoNacionCuenta || "00-018-294819"}
            </Text>
          </View>
          <View style={styles.docCodeBox}>
            <Text style={styles.docRuc}>RUC N° {empresa.ruc}</Text>
            <Text style={styles.docTitle}>CARTA DE PORTE TERRESTRE</Text>
            <Text style={styles.docSubtitle}>CONTRATO DE TRANSPORTE (CÓDIGO DE COMERCIO)</Text>
            <Text style={styles.docCorrelativo}>CP-{orden.codigoViaje}</Text>
          </View>
        </View>

        {/* SECCIÓN 1: PARTES CONTRATANTES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. SUJETOS DEL CONTRATO DE TRANSPORTE</Text>
            <Text style={styles.sectionBadge}>RELACIÓN BILATERAL</Text>
          </View>
          <View style={styles.row}>
            {/* Porteador */}
            <View style={[styles.col2, styles.card]}>
              <Text style={styles.label}>Porteador (Transportista Contratado)</Text>
              <Text style={styles.valueBold}>{empresa.razonSocial}</Text>
              <Text style={styles.value}>RUC: {empresa.ruc}</Text>
              <Text style={styles.value}>Domicilio: {empresa.direccionFiscal}</Text>
              <Text style={styles.value}>Teléfono / Email: {empresa.telefono || "01-492-8100"} · {empresa.email || "info@cargamaster.pe"}</Text>
            </View>

            {/* Cargador */}
            <View style={[styles.col2, styles.card]}>
              <Text style={styles.label}>Cargador / Remitente (Generador de Carga)</Text>
              <Text style={styles.valueBold}>{orden.cliente?.razonSocial || "Corporación Aceros Arequipa S.A."}</Text>
              <Text style={styles.value}>RUC: {orden.cliente?.numeroDocumento || "20100128218"}</Text>
              <Text style={styles.value}>Domicilio: {orden.cliente?.direccionFiscal || "Av. Industrial 450, Pisco / Lima"}</Text>
              <Text style={styles.value}>
                Contacto: {orden.cliente?.contactoNombre || "Gerencia de Despacho"} ({orden.cliente?.contactoTelefono || "998-112-334"})
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 2: OBJETO DEL TRANSPORTE Y RUTA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. ITINERARIO, RUTA COMERCIAL Y MEDIOS ASIGNADOS</Text>
            <Text style={styles.sectionBadge}>CONDICIONES DE TRASLADO</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col2, styles.cardFilled]}>
              <Text style={styles.label}>Trayecto y Distancia de Ruta</Text>
              <Text style={styles.valueBold}>
                Desde: {orden.ruta?.origenDistrito || "Callao"} ({orden.ruta?.origenDepartamento})
              </Text>
              <Text style={styles.valueBold}>
                Hasta: {orden.ruta?.destinoDistrito || "Arequipa"} ({orden.ruta?.destinoDepartamento})
              </Text>
              <Text style={styles.value}>Corredor: {orden.ruta?.nombre || "Panamericana Sur"} ({orden.ruta?.distanciaEstimadaKm || 1015} km)</Text>
            </View>

            <View style={[styles.col2, styles.cardFilled]}>
              <Text style={styles.label}>Unidades y Chofer Autorizado</Text>
              <Text style={styles.valueBold}>
                Tracto: {orden.unidad?.placa || "V7A-890"} ({orden.unidad?.marca || "Volvo"} {orden.unidad?.modelo || "FH 540"})
              </Text>
              <Text style={styles.valueBold}>
                Semirremolque: {orden.semirremolque?.placa || "Z1A-987"} ({orden.semirremolque?.tipoCarroceria?.toUpperCase() || "PLATAFORMA"})
              </Text>
              <Text style={styles.value}>
                Conductor: {orden.conductor ? `${orden.conductor.nombres} ${orden.conductor.apellidos}` : "Carlos Mendoza Vilca"}
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 3: MERCANCÍA TRANSPORTADA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. CARACTERÍSTICAS DE LA CARGA ENTREGADA</Text>
            <Text style={styles.sectionBadge}>DECLARACIÓN COMERCIAL</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Naturaleza de la Mercancía</Text>
              <Text style={styles.valueBold}>{orden.descripcionCarga || "Barras de acero corrugado de construcción"}</Text>
              <Text style={styles.value}>Modalidad: {orden.tipoCarga?.toUpperCase() || "CARGA COMPLETA FTL"}</Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Peso Total de la Carga</Text>
              <Text style={styles.valueHighlight}>{pesoEnTn} TONELADAS</Text>
              <Text style={styles.value}>Comprobación en balanza de origen</Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Condición de Carga y Riesgo</Text>
              <Text style={styles.value}>
                {esMatpel ? "CARGA PELIGROSA MATPEL (HOJA MSDS ADJUNTA)" : "CARGA GENERAL NO PERECIBLE"}
              </Text>
              <Text style={styles.value}>Seguro de Transporte: PÓLIZA VIGENTE</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 4: CONDICIONES ECONÓMICAS Y DETRACCIÓN SPOT 4% */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>4. VALOR DEL FLETE Y APLICACIÓN DE DETRACCIÓN SPOT SUNAT</Text>
            <Text style={styles.sectionBadge}>D.L. 940 · CÓDIGO SUNAT 027</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col4, styles.card]}>
              <Text style={styles.label}>Flete Bruto Pactado</Text>
              <Text style={[styles.valueHighlight, { fontSize: 10 }]}>
                {monedaSimbolo} {fleteTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.value}>Factura Electrónica: {facturaVinculada}</Text>
            </View>
            <View style={[styles.col4, styles.card]}>
              <Text style={styles.label}>Detracción SPOT (4%)</Text>
              <Text style={[styles.valueBold, { color: "#DC2626" }]}>
                {monedaSimbolo} {montoDetraccion.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.value}>Banco de la Nación 027</Text>
            </View>
            <View style={[styles.col4, styles.card]}>
              <Text style={styles.label}>Monto Neto a Pagar</Text>
              <Text style={[styles.valueBold, { color: "#16A34A", fontSize: 9.5 }]}>
                {monedaSimbolo} {montoNeto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.value}>A abonar al Porteador</Text>
            </View>
            <View style={[styles.col4, styles.card]}>
              <Text style={styles.label}>Condición Comercial</Text>
              <Text style={styles.valueBold}>
                {orden.cliente?.condicionPagoDias ? orden.cliente.condicionPagoDias.toUpperCase().replace("_", " ") : "CRÉDITO 30 DÍAS"}
              </Text>
              <Text style={styles.value}>Adelanto Viáticos: S/ {orden.adelantoViaticos || "0.00"}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 5: CLÁUSULAS GENERALES DE CONTRATACIÓN */}
        <View style={styles.section}>
          <View style={styles.cardFilled}>
            <Text style={styles.label}>CLÁUSULAS GENERALES DEL CONTRATO DE FLETE TERRESTRE</Text>
            <Text style={[styles.value, { fontSize: 6.5, lineHeight: 1.3 }]}>
              PRIMERA: El Porteador se obliga a transportar la mercancía descrita hasta el punto de entrega fijado, custodiándola con la debida diligencia. ·
              SEGUNDA (Detracciones): El Cargador retendrá el 4% del flete bruto para su depósito en la Cta. Cte. N° {empresa.bancoNacionCuenta || "00-018-294819"} del Banco de la Nación conforme al D.L. 940. ·
              TERCERA (Sobreestadías): Se concede un plazo máximo de 4 horas para labores de carga y 4 horas para descarga. Excedido este plazo, se computará sobreestadía a razón de US$ 50 por hora o fracción. ·
              CUARTA: Las partes se someten a la competencia de los jueces y tribunales del distrito judicial del domicilio del Porteador.
            </Text>
          </View>
        </View>

        {/* SECCIÓN 6: CÓDIGO QR Y VALIDACIÓN LEGAL */}
        <View style={styles.section}>
          <View style={styles.qrContainer}>
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} style={styles.qrImage} />
            ) : null}
            <View style={styles.qrText}>
              <Text style={styles.qrTitle}>CERTIFICACIÓN DIGITAL DE CARTA DE PORTE Y EMISIÓN TRIBUTARIA</Text>
              <Text style={styles.qrDesc}>
                Esta Carta de Porte Terrestre está legalmente vinculada a la Orden de Servicio {orden.codigoViaje} y al comprobante
                electrónico {facturaVinculada}. El código QR certifica la inalterabilidad de los términos económicos, la vigencia
                del seguro de carga y la habilitación de la flota ante el MTC y la SUNAT.
              </Text>
              <Text style={[styles.qrDesc, { marginTop: 2, fontFamily: "Helvetica-Bold" }]}>
                Hash Verificación: CP-{orden.codigoViaje}-{orden.cliente?.numeroDocumento || "20100128218"}-{fleteTotal}-SPOT4
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 7: FIRMAS DE CONFORMIDAD CONTRACTUAL */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>POR EL PORTEADOR</Text>
            <Text style={styles.signatureSub}>Empresa de Transporte</Text>
            <Text style={styles.signatureSub}>{empresa.razonSocial}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>POR EL CARGADOR / DADOR</Text>
            <Text style={styles.signatureSub}>Generador de Carga</Text>
            <Text style={styles.signatureSub}>{orden.cliente?.razonSocial || "Cliente"}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>CONFORMIDAD DESTINATARIO</Text>
            <Text style={styles.signatureSub}>Recepción de Mercadería</Text>
            <Text style={styles.signatureSub}>Firma, DNI y Sello</Text>
          </View>
        </View>

        {/* PIE DE PÁGINA */}
        <View style={styles.footer}>
          <Text>CargaMaster Pro · Carta de Porte Terrestre Homologada</Text>
          <Text>Emisión: {fechaEmision} · Contrato {orden.codigoViaje} · Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
}
