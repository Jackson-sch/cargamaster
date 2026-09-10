import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";

interface GRETransportistaPDFProps {
  empresa: {
    razonSocial: string;
    ruc: string;
    direccionFiscal: string;
    telefono?: string | null;
    email?: string | null;
    registroMtc?: string | null;
  };
  orden: any;
  qrCodeUrl: string;
  numeroGuia?: string;
}

export function GRETransportistaPDF({
  empresa,
  orden,
  qrCodeUrl,
  numeroGuia = "V001-000284",
}: GRETransportistaPDFProps) {
  const fechaHoy = new Date().toISOString().split("T")[0];
  const fechaTraslado = orden.fechaHoraProgramada
    ? new Date(orden.fechaHoraProgramada).toISOString().split("T")[0]
    : fechaHoy;

  const pesoKg = parseFloat(String(orden.pesoBrutoKg || "28000"));
  const pesoTn = (pesoKg / 1000).toFixed(2);

  const configVehicular =
    (orden.unidad?.ejes || 3) === 3 && (orden.semirremolque?.ejes || 3) === 3
      ? "T3S3 (Tracto 3 ejes + Semirremolque 3 ejes)"
      : "T3S2 (Tracto 3 ejes + Semirremolque 2 ejes)";

  return (
    <Document title={`GRE-Transportista-${orden.codigoViaje}`}>
      <Page size="A4" style={styles.page}>
        {/* Header Institucional y Caja SUNAT */}
        <View style={styles.headerContainer}>
          <View style={styles.companyBox}>
            <Text style={styles.companyName}>{empresa.razonSocial}</Text>
            <Text style={styles.companySub}>
              TRANSPORTE PÚBLICO DE CARGA PESADA INTERPROVINCIAL & NACIONAL
            </Text>
            <Text style={styles.companySub}>{empresa.direccionFiscal}</Text>
            <Text style={styles.companySub}>
              MTC N° {empresa.registroMtc || "15-REG-MTC/15.02"} · Tel: {empresa.telefono || "01-492-8100"}
            </Text>
          </View>

          <View style={styles.docCodeBox}>
            <Text style={styles.docRuc}>R.U.C. {empresa.ruc}</Text>
            <Text style={styles.docTitle}>GUÍA DE REMISIÓN ELECTRÓNICA</Text>
            <Text style={[styles.docSubtitle, { fontFamily: "Helvetica-Bold", color: "#0F172A" }]}>
              TRANSPORTISTA (TIPO 31)
            </Text>
            <Text style={styles.docCorrelativo}>{numeroGuia}</Text>
          </View>
        </View>

        {/* 1. Datos del Traslado y Modalidad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. DATOS DEL TRASLADO Y MODALIDAD DE SERVICIO</Text>
            <Text style={styles.sectionBadge}>R.S. 123-2022/SUNAT</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.col3, styles.cardFilled]}>
              <Text style={styles.label}>Motivo del Traslado</Text>
              <Text style={styles.valueBold}>TRANSPORTE DE BIENES (VENTA)</Text>
            </View>
            <View style={[styles.col3, styles.cardFilled]}>
              <Text style={styles.label}>Modalidad de Transporte</Text>
              <Text style={styles.valueBold}>TRANSPORTE PÚBLICO</Text>
            </View>
            <View style={[styles.col3, styles.cardFilled]}>
              <Text style={styles.label}>Fecha Inicio del Traslado</Text>
              <Text style={styles.valueHighlight}>{fechaTraslado}</Text>
            </View>
          </View>
        </View>

        {/* 2. Dador de Carga (Remitente) y Destinatario */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. DATOS DEL REMITENTE Y DESTINATARIO</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.col2, styles.card]}>
              <Text style={styles.label}>Remitente (Contratante del Flete)</Text>
              <Text style={styles.valueBold}>
                {orden.cliente?.razonSocial || "CLIENTE INDUSTRIAL S.A.C."}
              </Text>
              <Text style={styles.value}>RUC: {orden.cliente?.numeroDocumento || "20100128218"}</Text>
              <Text style={styles.value}>
                Dir: {orden.cliente?.direccionFiscal || "Planta Industrial / Centro de Distribución"}
              </Text>
            </View>

            <View style={[styles.col2, styles.card]}>
              <Text style={styles.label}>Destinatario Final de la Carga</Text>
              <Text style={styles.valueBold}>
                {orden.cliente?.razonSocial || "CONSIGNATARIO FINAL"}
              </Text>
              <Text style={styles.value}>RUC: {orden.cliente?.numeroDocumento || "20100128218"}</Text>
              <Text style={styles.value}>
                Punto Llegada: {orden.ruta?.destinoDistrito || orden.ruta?.destinoProvincia || "Almacén Central"}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Puntos de Partida y Llegada */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. PUNTOS DE PARTIDA Y LLEGADA (UBIGEO INEI)</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.col2, styles.cardFilled]}>
              <Text style={styles.label}>Punto de Partida</Text>
              <Text style={styles.valueBold}>
                {orden.ruta?.origenDistrito || orden.ruta?.origenProvincia} (Ubigeo: {orden.ruta?.origenUbigeo || "150101"})
              </Text>
              <Text style={styles.value}>
                {orden.ruta?.origenDireccion || "Terminal de Carga Callao / Lima"}
              </Text>
            </View>

            <View style={[styles.col2, styles.cardFilled]}>
              <Text style={styles.label}>Punto de Llegada</Text>
              <Text style={styles.valueBold}>
                {orden.ruta?.destinoDistrito || orden.ruta?.destinoProvincia} (Ubigeo: {orden.ruta?.destinoUbigeo || "040101"})
              </Text>
              <Text style={styles.value}>
                {orden.ruta?.destinoDireccion || "Mina / Almacén de Destino"}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Unidades de Transporte y Configuración MTC */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>4. UNIDADES DE TRANSPORTE Y CONDUCTOR HABILITADO</Text>
            <Text style={styles.sectionBadge}>SUTRAN RNAT ART. 81</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Tractocamión (Placa)</Text>
              <Text style={styles.valueHighlight}>{orden.unidad?.placa || "V7A-890"}</Text>
              <Text style={styles.value}>
                {orden.unidad?.marca} {orden.unidad?.modelo}
              </Text>
              <Text style={styles.value}>Cert. MTC: {orden.unidad?.tarjetaCirculacionNumero || "TUC-892014"}</Text>
            </View>

            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Semirremolque (Carreta)</Text>
              <Text style={styles.valueHighlight}>
                {orden.semirremolque?.placa || "Z1A-987"}
              </Text>
              <Text style={styles.value}>{orden.semirremolque?.tipoCarroceria || "Plataforma / Baranda"}</Text>
              <Text style={styles.value}>Config: {configVehicular.split(" ")[0]}</Text>
            </View>

            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Conductor Principal MTC</Text>
              <Text style={styles.valueBold}>
                {orden.conductor ? `${orden.conductor.apellidos}, ${orden.conductor.nombres}` : "Conductor Asignado"}
              </Text>
              <Text style={styles.value}>DNI: {orden.conductor?.numeroDocumento || "44589201"}</Text>
              <Text style={styles.value}>
                Licencia: {orden.conductor?.licencias?.[0]?.numeroLicencia || "Q44589201 (A-IIIc)"}
              </Text>
            </View>
          </View>
        </View>

        {/* 5. Bienes Transportados */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>5. DESCRIPCIÓN DE LA CARGA Y CONTROL DE PESO</Text>
            <Text style={styles.sectionBadge}>PESO TOTAL: {pesoTn} TONELADAS</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>ITEM</Text>
              <Text style={[styles.tableHeaderCell, { width: "52%" }]}>DESCRIPCIÓN DE LOS BIENES</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "center" }]}>UNIDAD</Text>
              <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "right" }]}>PESO BRUTO (KGM)</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "8%", fontFamily: "Helvetica-Bold" }]}>1</Text>
              <Text style={[styles.tableCell, { width: "52%", fontFamily: "Helvetica-Bold" }]}>
                {orden.descripcionCarga}
              </Text>
              <Text style={[styles.tableCell, { width: "15%", textAlign: "center" }]}>
                {orden.unidadMedida || "KGM"}
              </Text>
              <Text style={[styles.tableCell, { width: "25%", textAlign: "right", fontFamily: "Helvetica-Bold" }]}>
                {pesoKg.toLocaleString()} KGM
              </Text>
            </View>
          </View>
        </View>

        {/* QR y Declaración Legal SUNAT */}
        <View style={styles.qrContainer}>
          <Image src={qrCodeUrl} style={styles.qrImage} />
          <View style={styles.qrText}>
            <Text style={styles.qrTitle}>
              CONSTANCIA DE FISCALIZACIÓN SUTRAN Y CÓDIGO QR SUNAT
            </Text>
            <Text style={styles.qrDesc}>
              Representación impresa de la GUÍA DE REMISIÓN ELECTRÓNICA TRANSPORTISTA emitida conforme a la Resolución de Superintendencia N° 123-2022/SUNAT.
            </Text>
            <Text style={[styles.qrDesc, { marginTop: 2, fontFamily: "Helvetica-Bold" }]}>
              Orden de Servicio Ref: {orden.codigoViaje} · Flete Pactado: {orden.fletePactadoMoneda} {orden.fletePactadoMonto} · Sujeto al 4% SPOT
            </Text>
          </View>
        </View>

        {/* Firmas */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>DESPACHO TRANSPORTISTA</Text>
            <Text style={styles.signatureSub}>Firma y Sello Autorizado</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>CONDUCTOR ASIGNADO</Text>
            <Text style={styles.signatureSub}>Recepción de Carga y Docs</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>CONFORMIDAD DESTINATARIO</Text>
            <Text style={styles.signatureSub}>Firma, Fecha y Sello</Text>
          </View>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>CargaMaster Pro · Software Integral de Transporte Pesado</Text>
          <Text>Impreso el {fechaHoy} · Validez Oficial SUTRAN / MTC</Text>
          <Text>Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
}
