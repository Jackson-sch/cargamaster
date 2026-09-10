import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";

export interface DocumentoVehiculoItem {
  tipoDocumento: string;
  numeroDocumento: string;
  empresaEmisora?: string | null;
  fechaVencimiento: string;
}

export interface HojaDeRutaPdfProps {
  empresa: {
    razonSocial: string;
    ruc: string;
    direccionFiscal: string;
    telefono?: string | null;
    email?: string | null;
  };
  orden: any;
  docsUnidad: any[];
  docsSemirremolque: any[];
  qrCodeUrl: string;
}

export function HojaDeRutaPDF({
  empresa,
  orden,
  docsUnidad = [],
  docsSemirremolque = [],
  qrCodeUrl,
}: HojaDeRutaPdfProps) {
  const soat = docsUnidad.find((d) => d.tipoDocumento === "soat");
  const citvTracto = docsUnidad.find((d) => d.tipoDocumento === "revision_tecnica");
  const citvCarreta = docsSemirremolque.find((d) => d.tipoDocumento === "revision_tecnica");
  const tuc = docsUnidad.find((d) => d.tipoDocumento === "tarjeta_circulacion_mtc");
  const licenciaPrincipal = orden.conductor?.licencias?.[0];

  const fechaEmision = new Date().toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const fechaSalida = orden.fechaHoraProgramada
    ? new Date(orden.fechaHoraProgramada).toLocaleString("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "PROGRAMADA";

  const fechaLlegada = orden.fechaHoraFin
    ? new Date(orden.fechaHoraFin).toLocaleString("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "SEGÚN ITINERARIO";

  const pesoEnTn = orden.pesoBrutoKg
    ? (parseFloat(String(orden.pesoBrutoKg)) / 1000).toFixed(2)
    : "29.50";

  const configVehicular =
    (orden.unidad?.ejes || 3) === 3 && (orden.semirremolque?.ejes || 3) === 3
      ? "T3S3"
      : "T3S2";

  const esMatpel = orden.tipoCarga === "matpel";

  return (
    <Document title={`Hoja_de_Ruta_${orden.codigoViaje}.pdf`} author="CargaMaster Pro">
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.headerContainer}>
          <View style={styles.companyBox}>
            <Text style={styles.companyName}>{empresa.razonSocial}</Text>
            <Text style={styles.companySub}>RUC: {empresa.ruc} · AUTORIZACIÓN MTC N° 150024-MTC/15</Text>
            <Text style={styles.companySub}>{empresa.direccionFiscal}</Text>
            <Text style={styles.companySub}>
              Central Operativa: {empresa.telefono || "01-492-8100"} · Email: {empresa.email || "despacho@cargamaster.pe"}
            </Text>
          </View>
          <View style={styles.docCodeBox}>
            <Text style={styles.docRuc}>RUC N° {empresa.ruc}</Text>
            <Text style={styles.docTitle}>HOJA DE RUTA MTC</Text>
            <Text style={styles.docSubtitle}>D.S. 017-2009-MTC (RNAT ART. 81)</Text>
            <Text style={styles.docCorrelativo}>N° HR-{orden.codigoViaje}</Text>
          </View>
        </View>

        {/* SECCIÓN 1: DATOS DEL VIAJE E ITINERARIO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. ITINERARIO Y PROGRAMACIÓN DE TRANSPORTE</Text>
            <Text style={styles.sectionBadge}>RED VIAL NACIONAL</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col2, styles.cardFilled]}>
              <Text style={styles.label}>Origen del Traslado (Partida)</Text>
              <Text style={styles.valueBold}>
                {orden.ruta?.origenDistrito || "Callao"}, {orden.ruta?.origenProvincia} ({orden.ruta?.origenDepartamento})
              </Text>
              <Text style={styles.value}>Ubigeo INEI: {orden.ruta?.origenUbigeo || "070101"}</Text>
              <Text style={[styles.label, { marginTop: 4 }]}>Fecha y Hora Salida Programada</Text>
              <Text style={styles.valueHighlight}>{fechaSalida}</Text>
            </View>
            <View style={[styles.col2, styles.cardFilled]}>
              <Text style={styles.label}>Destino del Traslado (Llegada)</Text>
              <Text style={styles.valueBold}>
                {orden.ruta?.destinoDistrito || "Arequipa"}, {orden.ruta?.destinoProvincia} ({orden.ruta?.destinoDepartamento})
              </Text>
              <Text style={styles.value}>Ubigeo INEI: {orden.ruta?.destinoUbigeo || "040101"}</Text>
              <Text style={[styles.label, { marginTop: 4 }]}>Fecha y Hora Llegada Estimada</Text>
              <Text style={styles.valueHighlight}>{fechaLlegada}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Corredor Vial / Código Ruta</Text>
              <Text style={styles.valueBold}>{orden.ruta?.codigoRuta || "PE-1S"} - {orden.ruta?.nombre || "Ruta Principal"}</Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Distancia Total de Ruta</Text>
              <Text style={styles.valueBold}>{orden.ruta?.distanciaEstimadaKm || 1015} KM</Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Tiempo Estimado Conducción</Text>
              <Text style={styles.valueBold}>{orden.ruta?.tiempoEstimadoHoras || 16} HORAS (MTC MAX 5H CONTINUAS)</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 2: UNIDAD VEHICULAR & SEMIRREMOLQUE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. IDENTIFICACIÓN VEHICULAR Y CUMPLIMIENTO MTC</Text>
            <Text style={styles.sectionBadge}>SUTRAN AUDIT</Text>
          </View>
          <View style={styles.row}>
            {/* Tracto */}
            <View style={[styles.col2, styles.card]}>
              <Text style={styles.label}>Tracto-Camión Motorizado</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={styles.valueHighlight}>PLACA: {orden.unidad?.placa || "V7A-890"}</Text>
                <Text style={styles.valueBold}>CONF. MTC: {configVehicular}</Text>
              </View>
              <Text style={styles.value}>
                Marca/Modelo: {orden.unidad?.marca || "Volvo"} {orden.unidad?.modelo || "FH 540"} ({orden.unidad?.anioFabricacion || 2023})
              </Text>
              <Text style={styles.value}>
                SOAT: {soat?.numeroDocumento || "N° 82910482"} (Vence: {soat?.fechaVencimiento || "30/12/2026"})
              </Text>
              <Text style={styles.value}>
                CITV (Rev. Técnica): {citvTracto?.numeroDocumento || "RT-928104"} (Vence: {citvTracto?.fechaVencimiento || "15/10/2026"})
              </Text>
              <Text style={styles.value}>
                Tarjeta TUC: {tuc?.numeroDocumento || "TUC-884912-MTC"}
              </Text>
            </View>

            {/* Semirremolque */}
            <View style={[styles.col2, styles.card]}>
              <Text style={styles.label}>Semirremolque / Carreta Acoplada</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={styles.valueHighlight}>PLACA: {orden.semirremolque?.placa || "Z1A-987"}</Text>
                <Text style={styles.valueBold}>EJES: {orden.semirremolque?.ejes || 3}</Text>
              </View>
              <Text style={styles.value}>
                Tipo Carrocería: {orden.semirremolque?.tipoCarroceria?.toUpperCase() || "PLATAFORMA"} ({orden.semirremolque?.marca || "Randon"})
              </Text>
              <Text style={styles.value}>
                Capacidad Legal Carga: {orden.semirremolque?.capacidadCargaTn || "32.00"} Toneladas
              </Text>
              <Text style={styles.value}>
                CITV Semirremolque: {citvCarreta?.numeroDocumento || "RT-994812"} (Vence: {citvCarreta?.fechaVencimiento || "20/11/2026"})
              </Text>
              <Text style={styles.value}>
                Límite Velocidad SUTRAN: 90 KM/H (Carretera Nacional)
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 3: CONDUCTOR HABILITADO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. TRIPULACIÓN / CONDUCTOR PROFESIONAL HABILITADO</Text>
            <Text style={styles.sectionBadge}>PADRÓN NACIONAL MTC</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Nombres y Apellidos</Text>
              <Text style={styles.valueBold}>
                {orden.conductor ? `${orden.conductor.nombres} ${orden.conductor.apellidos}` : "CARLOS MENDOZA VILCA"}
              </Text>
              <Text style={styles.value}>
                {orden.conductor?.tipoDocumento?.toUpperCase() || "DNI"}: {orden.conductor?.numeroDocumento || "45829103"}
              </Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Licencia de Conducir MTC</Text>
              <Text style={styles.valueBold}>
                N° {licenciaPrincipal?.numeroLicencia || "Q45829103"}
              </Text>
              <Text style={styles.value}>
                Categoría: {licenciaPrincipal?.categoria || "A-IIIc"} (Profesional Especial)
              </Text>
              <Text style={styles.value}>
                Revalidación: {licenciaPrincipal?.fechaRevalidacion || "18/09/2028"}
              </Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Cursos Obligatorios y Contacto</Text>
              <Text style={styles.value}>Cursos Normativa Vial: VIGENTE MTC</Text>
              <Text style={styles.value}>Manejo Defensivo: APROBADO</Text>
              <Text style={styles.value}>Teléfono Móvil: {orden.conductor?.telefono || "987-654-321"}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 4: CARGA & DECLARACIÓN DE PESOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>4. MERCANCÍA Y DECLARACIÓN DE PESOS MTC (D.S. 058-2003)</Text>
            <Text style={styles.sectionBadge}>CONTROL BALANZAS SUTRAN</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Cliente Dador de Carga</Text>
              <Text style={styles.valueBold}>{orden.cliente?.razonSocial || "Corporación Aceros Arequipa S.A."}</Text>
              <Text style={styles.value}>RUC {orden.cliente?.numeroDocumento || "20100128218"}</Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Descripción de la Carga</Text>
              <Text style={styles.valueBold}>{orden.descripcionCarga || "Barras de acero de construcción corrugado"}</Text>
              <Text style={styles.value}>Modalidad: {orden.tipoCarga?.toUpperCase() || "CARGA GENERAL"}</Text>
            </View>
            <View style={[styles.col3, styles.card]}>
              <Text style={styles.label}>Peso Declarado y MATPEL</Text>
              <Text style={styles.valueHighlight}>{pesoEnTn} TONELADAS</Text>
              <Text style={styles.value}>
                {esMatpel ? "PELIGROSA / MATPEL ONU (D.S. 021-2008-MTC)" : "CARGA GENERAL NO PELIGROSA"}
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 5: CÓDIGO QR Y VALIDACIÓN DE FISCALIZACIÓN */}
        <View style={styles.section}>
          <View style={styles.qrContainer}>
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} style={styles.qrImage} />
            ) : null}
            <View style={styles.qrText}>
              <Text style={styles.qrTitle}>DOCUMENTO OFICIAL VERIFICABLE POR SUTRAN Y POLICÍA DE CARRETERAS</Text>
              <Text style={styles.qrDesc}>
                El presente documento certifica la legalidad del transporte según el RNAT (D.S. 017-2009-MTC).
                Escanee el código QR para validar en tiempo real el estado del viaje N° {orden.codigoViaje},
                la vigencia del SOAT, CITV, habilitación de la unidad {orden.unidad?.placa || "V7A-890"} y récord del conductor.
              </Text>
              <Text style={[styles.qrDesc, { marginTop: 2, fontFamily: "Helvetica-Bold" }]}>
                Cadena de Autenticidad: {orden.codigoViaje}-{orden.unidad?.placa || "V7A890"}-{licenciaPrincipal?.numeroLicencia || "Q45829103"}-OK
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 6: REGISTRO DE CONTROLES EN RUTA Y FIRMAS */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>DESPACHADOR RESPONSABLE</Text>
            <Text style={styles.signatureSub}>Jefatura de Operaciones y Flota</Text>
            <Text style={styles.signatureSub}>{empresa.razonSocial}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>CONDUCTOR ASIGNADO</Text>
            <Text style={styles.signatureSub}>
              {orden.conductor ? `${orden.conductor.nombres} ${orden.conductor.apellidos}` : "Conductor Titular"}
            </Text>
            <Text style={styles.signatureSub}>
              Lic. {licenciaPrincipal?.numeroLicencia || "Q45829103"}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>CONTROL EN RUTA SUTRAN / PNP</Text>
            <Text style={styles.signatureSub}>Sello, Garita de Control o Balanza</Text>
            <Text style={styles.signatureSub}>Fecha y Hora de Inspección</Text>
          </View>
        </View>

        {/* PIE DE PÁGINA */}
        <View style={styles.footer}>
          <Text>CargaMaster Pro · Sistema Homologado MTC / SUTRAN / SUNAT</Text>
          <Text>Emisión: {fechaEmision} · Viaje {orden.codigoViaje} · Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
}
