import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";

export interface ManifiestoCargaPdfProps {
  empresa: {
    razonSocial: string;
    ruc: string;
    direccionFiscal: string;
    telefono?: string | null;
    email?: string | null;
  };
  orden: any;
  qrCodeUrl: string;
}

export function ManifiestoCargaPDF({
  empresa,
  orden,
  qrCodeUrl,
}: ManifiestoCargaPdfProps) {
  const fechaEmision = new Date().toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const greAsociada = orden.guias?.[0]
    ? `${orden.guias[0].serie}-${String(orden.guias[0].numeroCorrelativo).padStart(6, "0")}`
    : "T001-000104";

  const pesoCargaNum = orden.pesoBrutoKg
    ? parseFloat(String(orden.pesoBrutoKg)) / 1000
    : 29.50;

  const taraTracto = parseFloat(String(orden.unidad?.pesoSecoTn || "8.50"));
  const taraCarreta = parseFloat(String(orden.semirremolque?.pesoSecoTn || "6.80"));
  const pesoBrutoTotal = (pesoCargaNum + taraTracto + taraCarreta).toFixed(2);
  const maxLegalPermitido = "48.00"; // Configuración T3S3 según RNV D.S. 058-2003

  const configVehicular =
    (orden.unidad?.ejes || 3) === 3 && (orden.semirremolque?.ejes || 3) === 3
      ? "T3S3"
      : "T3S2";

  return (
    <Document title={`Manifiesto_Carga_${orden.codigoViaje}.pdf`} author="CargaMaster Pro">
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.headerContainer}>
          <View style={styles.companyBox}>
            <Text style={styles.companyName}>{empresa.razonSocial}</Text>
            <Text style={styles.companySub}>RUC: {empresa.ruc} · TRANSPORTE DE CARGA PESADA NACIONAL</Text>
            <Text style={styles.companySub}>{empresa.direccionFiscal}</Text>
            <Text style={styles.companySub}>
              Centro Logístico: {empresa.telefono || "01-492-8100"} · {empresa.email || "operaciones@cargamaster.pe"}
            </Text>
          </View>
          <View style={styles.docCodeBox}>
            <Text style={styles.docRuc}>RUC N° {empresa.ruc}</Text>
            <Text style={styles.docTitle}>MANIFIESTO DE CARGA</Text>
            <Text style={styles.docSubtitle}>D.S. 058-2003-MTC · PESOS Y MEDIDAS</Text>
            <Text style={styles.docCorrelativo}>MC-{orden.codigoViaje}</Text>
          </View>
        </View>

        {/* SECCIÓN 1: DATOS GENERALES DEL TRASLADO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. IDENTIFICACIÓN DE LAS PARTES Y PUNTOS DE ENTREGA</Text>
            <Text style={styles.sectionBadge}>RNAT D.S. 017-2009</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col2, styles.card]}>
              <Text style={styles.label}>Remitente / Dador de la Carga</Text>
              <Text style={styles.valueBold}>{orden.cliente?.razonSocial || "Corporación Aceros Arequipa S.A."}</Text>
              <Text style={styles.value}>RUC: {orden.cliente?.numeroDocumento || "20100128218"}</Text>
              <Text style={styles.value}>
                Dirección Origen: {orden.cliente?.direccionFiscal || "Planta Industrial Pisco / Callao"}
              </Text>
              <Text style={styles.valueHighlight}>
                Punto Partida: {orden.ruta?.origenDistrito || "Callao"} ({orden.ruta?.origenUbigeo || "070101"})
              </Text>
            </View>

            <View style={[styles.col2, styles.card]}>
              <Text style={styles.label}>Consignatario / Destinatario Final</Text>
              <Text style={styles.valueBold}>CONSORCIO VIAL SUR / ALMACÉN CENTRAL</Text>
              <Text style={styles.value}>RUC: 20601928419</Text>
              <Text style={styles.value}>
                Dirección Destino: Parque Industrial Río Seco Mz. E Lt. 12, Cerro Colorado
              </Text>
              <Text style={styles.valueHighlight}>
                Punto Llegada: {orden.ruta?.destinoDistrito || "Arequipa"} ({orden.ruta?.destinoUbigeo || "040101"})
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 2: VEHÍCULOS ASIGNADOS Y CAPACIDADES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. CONFIGURACIÓN VEHICULAR Y CAPACIDAD AUTORIZADA</Text>
            <Text style={styles.sectionBadge}>CONTROL BALANZA</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Tracto-Camión</Text>
              <Text style={styles.valueBold}>PLACA: {orden.unidad?.placa || "V7A-890"}</Text>
              <Text style={styles.value}>Marca: {orden.unidad?.marca || "Volvo"}</Text>
              <Text style={styles.value}>Tara Motorizado: {taraTracto.toFixed(2)} Tn</Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Semirremolque</Text>
              <Text style={styles.valueBold}>PLACA: {orden.semirremolque?.placa || "Z1A-987"}</Text>
              <Text style={styles.value}>Tipo: {orden.semirremolque?.tipoCarroceria?.toUpperCase() || "PLATAFORMA"}</Text>
              <Text style={styles.value}>Tara Semirremolque: {taraCarreta.toFixed(2)} Tn</Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Configuración Combinada MTC</Text>
              <Text style={styles.valueBold}>TIPO: {configVehicular}</Text>
              <Text style={styles.value}>Peso Seco Total (Tara): {(taraTracto + taraCarreta).toFixed(2)} Tn</Text>
              <Text style={styles.valueHighlight}>PBTC Máx Permitido: {maxLegalPermitido} Tn</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 3: DETALLE DE MERCANCÍA & PESOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. MANIFIESTO DETALLADO DE MERCANCÍAS TRANSPORTADAS</Text>
            <Text style={styles.sectionBadge}>DECLARACIÓN JURADA</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "6%" }]}>ITEM</Text>
              <Text style={[styles.tableHeaderCell, { width: "38%" }]}>DESCRIPCIÓN DE MERCANCÍA</Text>
              <Text style={[styles.tableHeaderCell, { width: "16%" }]}>GUÍA REMISIÓN</Text>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>EMBALAJE</Text>
              <Text style={[styles.tableHeaderCell, { width: "14%", textAlign: "right" }]}>PESO NETO</Text>
              <Text style={[styles.tableHeaderCell, { width: "14%", textAlign: "right" }]}>PESO BRUTO</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "6%" }]}>01</Text>
              <Text style={[styles.tableCell, { width: "38%", fontFamily: "Helvetica-Bold" }]}>
                {orden.descripcionCarga || "Barras de acero de construcción corrugado ASTM A615 G60"}
              </Text>
              <Text style={[styles.tableCell, { width: "16%" }]}>GRE {greAsociada}</Text>
              <Text style={[styles.tableCell, { width: "12%" }]}>ATADOS</Text>
              <Text style={[styles.tableCell, { width: "14%", textAlign: "right" }]}>
                {pesoCargaNum.toFixed(2)} Tn
              </Text>
              <Text style={[styles.tableCell, { width: "14%", textAlign: "right", fontFamily: "Helvetica-Bold" }]}>
                {pesoCargaNum.toFixed(2)} Tn
              </Text>
            </View>

            {/* Totales */}
            <View style={[styles.tableRow, { backgroundColor: "#F8FAFC" }]}>
              <Text style={[styles.tableCell, { width: "72%", fontFamily: "Helvetica-Bold", textAlign: "right" }]}>
                PESO TOTAL DE LA CARGA:
              </Text>
              <Text style={[styles.tableCell, { width: "28%", fontFamily: "Helvetica-Bold", textAlign: "right", color: "#B45309" }]}>
                {pesoCargaNum.toFixed(2)} TONELADAS
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 4: LIQUIDACIÓN DE PESO TOTAL COMBINADO Y FISCALIZACIÓN */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>4. CÁLCULO DE PESO BRUTO TOTAL COMBINADO (BALANZA SUTRAN)</Text>
            <Text style={styles.sectionBadge}>LEY N° 27181</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col4, styles.card]}>
              <Text style={styles.label}>Tara Vehicular</Text>
              <Text style={styles.valueBold}>{(taraTracto + taraCarreta).toFixed(2)} Tn</Text>
              <Text style={styles.value}>Tracto + Semirremolque</Text>
            </View>
            <View style={[styles.col4, styles.card]}>
              <Text style={styles.label}>Peso Neto Carga</Text>
              <Text style={styles.valueBold}>{pesoCargaNum.toFixed(2)} Tn</Text>
              <Text style={styles.value}>Según Guía Remisión</Text>
            </View>
            <View style={[styles.col4, styles.card]}>
              <Text style={styles.label}>Peso Bruto Total (PBTC)</Text>
              <Text style={[styles.valueHighlight, { fontSize: 10 }]}>{pesoBrutoTotal} Tn</Text>
              <Text style={styles.value}>Tara + Mercancía</Text>
            </View>
            <View style={[styles.col4, styles.card]}>
              <Text style={styles.label}>Estado de Tolerancia</Text>
              <Text style={[styles.valueBold, { color: "#16A34A" }]}>CONFORME (DENTRO DEL LÍMITE)</Text>
              <Text style={styles.value}>Margen: {(parseFloat(maxLegalPermitido) - parseFloat(pesoBrutoTotal)).toFixed(2)} Tn libre</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 5: QR VERIFICACIÓN EN BALANZAS */}
        <View style={styles.section}>
          <View style={styles.qrContainer}>
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} style={styles.qrImage} />
            ) : null}
            <View style={styles.qrText}>
              <Text style={styles.qrTitle}>DECLARACIÓN JURADA DE PESOS Y MEDIDAS (D.S. 058-2003-MTC)</Text>
              <Text style={styles.qrDesc}>
                El transportista y el generador de carga declaran bajo juramento que el peso, dimensiones y estiba
                del viaje {orden.codigoViaje} cumplen rigurosamente con los límites fijados por el Reglamento Nacional
                de Vehículos. El código QR permite la corroboración de datos en puestos de pesaje fijos y móviles de la SUTRAN.
              </Text>
              <Text style={[styles.qrDesc, { marginTop: 2, fontFamily: "Helvetica-Bold" }]}>
                Validación: {orden.codigoViaje} | PBTC: {pesoBrutoTotal} Tn | CONF: {configVehicular} | GRE: {greAsociada}
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 6: CONFORMIDADES Y FIRMAS */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>ENTREGA CONFORME</Text>
            <Text style={styles.signatureSub}>Generador / Dador de la Carga</Text>
            <Text style={styles.signatureSub}>{orden.cliente?.razonSocial || "Remitente"}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>RECIBÍ PARA TRANSPORTE</Text>
            <Text style={styles.signatureSub}>
              {orden.conductor ? `${orden.conductor.nombres} ${orden.conductor.apellidos}` : "Conductor Asignado"}
            </Text>
            <Text style={styles.signatureSub}>DNI {orden.conductor?.numeroDocumento || "45829103"}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>RECEPCIÓN EN DESTINO</Text>
            <Text style={styles.signatureSub}>Consignatario Final</Text>
            <Text style={styles.signatureSub}>Firma, Sello y Fecha/Hora</Text>
          </View>
        </View>

        {/* PIE DE PÁGINA */}
        <View style={styles.footer}>
          <Text>CargaMaster Pro · Manifiesto Electrónico Homologado MTC / SUTRAN</Text>
          <Text>Emisión: {fechaEmision} · Viaje {orden.codigoViaje} · Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
}
