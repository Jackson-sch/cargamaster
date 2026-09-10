/**
 * Módulo de Construcción UBL 2.1 y Formateo SUNAT para Heavy Freight Transport
 * Cumple con la normativa SUNAT de Guías de Remisión Electrónicas (GRE-Transportista Catálogo 31)
 * y Facturación Electrónica con Detracción SPOT del 4% (Código SUNAT 027).
 */

import crypto from "crypto";

export interface DatosEmisorSunat {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  cuentaBancoNacion?: string;
}

export interface DatosGreTransportistaInput {
  serie: string;
  correlativo: number;
  fechaEmision: string; // YYYY-MM-DD
  fechaInicioTraslado: string; // YYYY-MM-DD
  // Datos del Pagador / Dador del servicio
  remitenteRuc: string;
  remitenteRazonSocial: string;
  // Datos del Destinatario
  destinatarioTipoDoc: "6" | "1"; // 6: RUC, 1: DNI
  destinatarioNumDoc: string;
  destinatarioRazonSocial: string;
  // Ubicaciones de Transporte
  partidaUbigeo: string;
  partidaDireccion: string;
  llegadaUbigeo: string;
  llegadaDireccion: string;
  // Vehículo & Conductor
  placaTracto: string;
  placaSemirremolque?: string;
  conductorDni: string;
  conductorNombres: string;
  conductorApellidos: string;
  conductorLicencia: string;
  // Carga
  motivoTraslado?: string; // "01": Venta, "04": Traslado entre establecimientos, "13": Otros
  descripcionCarga: string;
  pesoBrutoTotalKg: number;
  unidadMedida?: string; // "KGM" o "TNE"
}

export interface DatosFacturaInput {
  serie: string;
  correlativo: number;
  fechaEmision: string; // YYYY-MM-DD
  fechaVencimiento?: string;
  moneda: "PEN" | "USD";
  clienteRuc: string;
  clienteRazonSocial: string;
  clienteDireccion: string;
  // Detalles del flete
  descripcionServicio: string;
  valorVenta: number; // Subtotal sin IGV
  igv: number; // 18%
  total: number;
  // Detracción SPOT SUNAT
  aplicaDetraccion: boolean;
  porcentajeDetraccion?: number; // 4.00
  montoDetraccion?: number;
  cuentaBancoNacion?: string;
}

/**
 * Genera el string formateado del Código QR exigido por la Resolución SUNAT
 */
export function generarQrCodeSunat(params: {
  rucEmisor: string;
  tipoComprobante: string; // "01" Factura, "09" o "31" GRE
  serie: string;
  correlativo: number;
  igv: number;
  total: number;
  fechaEmision: string;
  tipoDocAdquirente: string; // "6" RUC, "1" DNI
  numDocAdquirente: string;
  hashCpe: string;
}): string {
  const correlativoPad = String(params.correlativo).padStart(8, "0");
  const igvStr = params.igv.toFixed(2);
  const totalStr = params.total.toFixed(2);

  return [
    params.rucEmisor,
    params.tipoComprobante,
    params.serie,
    correlativoPad,
    igvStr,
    totalStr,
    params.fechaEmision,
    params.tipoDocAdquirente,
    params.numDocAdquirente,
    params.hashCpe,
  ].join("|");
}

/**
 * Genera un Hash digital simulado representativo del digest UBL SHA-1 / SHA-256
 */
export function generarDigestHashUbl(contenido: string): string {
  return crypto.createHash("sha256").update(contenido).digest("base64").substring(0, 28);
}

/**
 * Genera la estructura XML UBL 2.1 canónica para la GRE-Transportista (SUNAT 31)
 */
export function generarXmlGreTransportista(
  emisor: DatosEmisorSunat,
  gre: DatosGreTransportistaInput
): { xml: string; hashCpe: string; qrCode: string; ticketSimulado: string } {
  const idComprobante = `${gre.serie}-${String(gre.correlativo).padStart(8, "0")}`;
  const fechaHora = `${gre.fechaEmision}T08:00:00`;

  const xmlBody = `<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>
<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2"
                xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- Firma Digital XMLDSig SHA-256 con Certificado Tributario SUNAT -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${idComprobante}</cbc:ID>
  <cbc:IssueDate>${gre.fechaEmision}</cbc:IssueDate>
  <cbc:IssueTime>08:00:00</cbc:IssueTime>
  <cbc:DespatchAdviceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01">31</cbc:DespatchAdviceTypeCode>
  
  <!-- Transportista Emisor -->
  <cac:DespatchSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6" schemeName="Documento de Identidad" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${emisor.ruc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${emisor.razonSocial}]]></cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:DespatchSupplierParty>

  <!-- Pagador del Flete / Remitente Dador de Carga -->
  <cac:DeliveryCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6">${gre.remitenteRuc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${gre.remitenteRazonSocial}]]></cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:DeliveryCustomerParty>

  <!-- Destinatario -->
  <cac:SellerSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="${gre.destinatarioTipoDoc}">${gre.destinatarioNumDoc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${gre.destinatarioRazonSocial}]]></cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:SellerSupplierParty>

  <!-- Datos del Envío y Traslado -->
  <cac:Shipment>
    <cbc:ID>1</cbc:ID>
    <cbc:HandlingCode listAgencyName="PE:SUNAT" listName="Motivo de Traslado" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo20">${gre.motivoTraslado || "01"}</cbc:HandlingCode>
    <cbc:InformationAmount currencyID="PEN">0.00</cbc:InformationAmount>
    <cbc:GrossWeightMeasure unitCode="${gre.unidadMedida || "KGM"}">${gre.pesoBrutoTotalKg.toFixed(2)}</cbc:GrossWeightMeasure>
    <cbc:TotalTransportHandlingUnitQuantity>1</cbc:TotalTransportHandlingUnitQuantity>

    <cac:ShipmentStage>
      <cbc:TransportModeCode listAgencyName="PE:SUNAT" listName="Modalidad de Traslado" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo18">01</cbc:TransportModeCode>
      <cac:TransitPeriod>
        <cbc:StartDate>${gre.fechaInicioTraslado}</cbc:StartDate>
      </cac:TransitPeriod>
      
      <!-- Chofer Conductor MTC -->
      <cac:DriverPerson>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="1">${gre.conductorDni}</cbc:ID>
        <cbc:FirstName><![CDATA[${gre.conductorNombres}]]></cbc:FirstName>
        <cbc:FamilyName><![CDATA[${gre.conductorApellidos}]]></cbc:FamilyName>
        <cbc:JobTitle>Principal</cbc:JobTitle>
        <cac:IdentityDocumentReference>
          <cbc:ID>${gre.conductorLicencia}</cbc:ID>
        </cac:IdentityDocumentReference>
      </cac:DriverPerson>
    </cac:ShipmentStage>

    <!-- Vehículos MTC: Tracto + Carreta -->
    <cac:TransportHandlingUnit>
      <cac:TransportEquipment>
        <cbc:ID>${gre.placaTracto}</cbc:ID>
        ${
          gre.placaSemirremolque
            ? `<cac:AttachedTransportEquipment><cbc:ID>${gre.placaSemirremolque}</cbc:ID></cac:AttachedTransportEquipment>`
            : ""
        }
      </cac:TransportEquipment>
    </cac:TransportHandlingUnit>

    <!-- Punto de Partida -->
    <cac:OriginAddress>
      <cbc:ID schemeAgencyName="PE:INEI" schemeName="Ubigeos">${gre.partidaUbigeo}</cbc:ID>
      <cac:AddressLine>
        <cbc:Line><![CDATA[${gre.partidaDireccion}]]></cbc:Line>
      </cac:AddressLine>
    </cac:OriginAddress>

    <!-- Punto de Llegada -->
    <cac:DeliveryAddress>
      <cbc:ID schemeAgencyName="PE:INEI" schemeName="Ubigeos">${gre.llegadaUbigeo}</cbc:ID>
      <cac:AddressLine>
        <cbc:Line><![CDATA[${gre.llegadaDireccion}]]></cbc:Line>
      </cac:AddressLine>
    </cac:DeliveryAddress>
  </cac:Shipment>

  <!-- Bienes Transportados -->
  <cac:DespatchLine>
    <cbc:ID>1</cbc:ID>
    <cbc:DeliveredQuantity unitCode="${gre.unidadMedida || "KGM"}">${gre.pesoBrutoTotalKg.toFixed(2)}</cbc:DeliveredQuantity>
    <cac:OrderLineReference>
      <cbc:LineID>1</cbc:LineID>
    </cac:OrderLineReference>
    <cac:Item>
      <cbc:Description><![CDATA[${gre.descripcionCarga}]]></cbc:Description>
    </cac:Item>
  </cac:DespatchLine>
</DespatchAdvice>`;

  const hashCpe = generarDigestHashUbl(xmlBody);
  const qrCode = generarQrCodeSunat({
    rucEmisor: emisor.ruc,
    tipoComprobante: "31",
    serie: gre.serie,
    correlativo: gre.correlativo,
    igv: 0,
    total: 0,
    fechaEmision: gre.fechaEmision,
    tipoDocAdquirente: "6",
    numDocAdquirente: gre.remitenteRuc,
    hashCpe,
  });

  const ticketSimulado = `TK-GRE-${Date.now().toString().slice(-8)}`;

  return {
    xml: xmlBody,
    hashCpe,
    qrCode,
    ticketSimulado,
  };
}

/**
 * Genera la estructura XML UBL 2.1 canónica para la Factura Electrónica (SUNAT 01)
 * con Cláusula y Leyenda obligatoria de Detracción SPOT del 4% (Servicio 027).
 */
export function generarXmlFacturaElectronica(
  emisor: DatosEmisorSunat,
  factura: DatosFacturaInput
): { xml: string; hashCpe: string; qrCode: string; ticketSimulado: string } {
  const idComprobante = `${factura.serie}-${String(factura.correlativo).padStart(8, "0")}`;

  const xmlBody = `<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- Firma Digital XMLDSig SHA-256 -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${idComprobante}</cbc:ID>
  <cbc:IssueDate>${factura.fechaEmision}</cbc:IssueDate>
  <cbc:IssueTime>09:30:00</cbc:IssueTime>
  ${factura.fechaVencimiento ? `<cbc:DueDate>${factura.fechaVencimiento}</cbc:DueDate>` : ""}
  <cbc:InvoiceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01">01</cbc:InvoiceTypeCode>
  
  <!-- Leyenda SPOT SUNAT 4% Transporte Terrestre -->
  <cbc:Note languageLocaleID="2006">Operación sujeta al Sistema de Pago de Obligaciones Tributarias con el Gobierno Central - SPOT D.L. 940 (4%)</cbc:Note>
  ${
    emisor.cuentaBancoNacion
      ? `<cbc:Note languageLocaleID="3000">Cta. Cte. Banco de la Nación N° ${emisor.cuentaBancoNacion}</cbc:Note>`
      : ""
  }

  <cbc:DocumentCurrencyCode>${factura.moneda}</cbc:DocumentCurrencyCode>

  <!-- Datos Emisor / Empresa Transportista -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6">${emisor.ruc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name><![CDATA[${emisor.nombreComercial || emisor.razonSocial}]]></cbc:Name>
      </cac:PartyName>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${emisor.razonSocial}]]></cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cbc:AddressTypeCode>0000</cbc:AddressTypeCode>
          <cac:AddressLine>
            <cbc:Line><![CDATA[${emisor.direccion}]]></cbc:Line>
          </cac:AddressLine>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Datos Cliente / Contratante -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6">${factura.clienteRuc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${factura.clienteRazonSocial}]]></cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cac:AddressLine>
            <cbc:Line><![CDATA[${factura.clienteDireccion}]]></cbc:Line>
          </cac:AddressLine>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Impuestos Totales (IGV 18%) -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${factura.moneda}">${factura.igv.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${factura.moneda}">${factura.valorVenta.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${factura.moneda}">${factura.igv.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:ID>1000</cbc:ID>
          <cbc:Name>IGV</cbc:Name>
          <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Totales Monetarios -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${factura.moneda}">${factura.valorVenta.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="${factura.moneda}">${factura.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${factura.moneda}">${factura.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Ítem: Servicio de Flete de Carga Pesada -->
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="ZZ">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${factura.moneda}">${factura.valorVenta.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:PricingReference>
      <cac:AlternativeConditionPrice>
        <cbc:PriceAmount currencyID="${factura.moneda}">${factura.total.toFixed(2)}</cbc:PriceAmount>
        <cbc:PriceTypeCode>01</cbc:PriceTypeCode>
      </cac:AlternativeConditionPrice>
    </cac:PricingReference>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${factura.moneda}">${factura.igv.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${factura.moneda}">${factura.valorVenta.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${factura.moneda}">${factura.igv.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>18.00</cbc:Percent>
          <cbc:TaxExemptionReasonCode>10</cbc:TaxExemptionReasonCode>
          <cac:TaxScheme>
            <cbc:ID>1000</cbc:ID>
            <cbc:Name>IGV</cbc:Name>
            <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description><![CDATA[${factura.descripcionServicio}]]></cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${factura.moneda}">${factura.valorVenta.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  const hashCpe = generarDigestHashUbl(xmlBody);
  const qrCode = generarQrCodeSunat({
    rucEmisor: emisor.ruc,
    tipoComprobante: "01",
    serie: factura.serie,
    correlativo: factura.correlativo,
    igv: factura.igv,
    total: factura.total,
    fechaEmision: factura.fechaEmision,
    tipoDocAdquirente: "6",
    numDocAdquirente: factura.clienteRuc,
    hashCpe,
  });

  const ticketSimulado = `TK-FT-${Date.now().toString().slice(-8)}`;

  return {
    xml: xmlBody,
    hashCpe,
    qrCode,
    ticketSimulado,
  };
}
