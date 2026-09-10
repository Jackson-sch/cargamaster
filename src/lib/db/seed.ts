import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import {
  empresas,
  sedes,
  usuarios,
  unidades,
  semirremolques,
  asignacionesTractoCarreta,
  documentosVehiculo,
  conductores,
  licenciasConductor,
  certificacionesConductor,
  clientes,
  rutas,
  ordenesServicio,
  historialEstadosViaje,
  posicionesTelemetria,
  alertasSistema,
  consumoCombustible,
  guiasRemision,
  comprobantesPago,
} from "./schema";

export async function runSeed() {
  console.log("🚛 Iniciando Seeding de CargaMaster Pro...");

  // 1. Empresa de Transporte de Carga Pesada
  const [empresa] = await db
    .insert(empresas)
    .values({
      ruc: "20601234567",
      razonSocial: "TRANSPORTES Y LOGISTICA TRANSANDINA S.A.C.",
      nombreComercial: "TRANSANDINA HEAVY CARGO",
      direccionFiscal: "Av. Néstor Gambetta Km 7.5, Callao, Lima",
      telefono: "01-512-9800",
      email: "operaciones@transandina.pe",
      configAlertasDias: [30, 15, 7, 0],
      activo: true,
    })
    .onConflictDoNothing()
    .returning();

  let empresaId = empresa?.id;
  if (!empresaId) {
    const existing = await db.query.empresas.findFirst();
    if (existing) {
      empresaId = existing.id;
      console.log(`ℹ️ Empresa existente encontrada: ${existing.razonSocial}`);
    } else {
      console.log("❌ No se encontró empresa.");
      return;
    }
  } else {
    console.log(`✅ Empresa creada: ${empresa.razonSocial}`);
  }

  // Verificar si ya existe una orden de servicio para asociar la GRE y Factura inicial
  const viajeExistente = await db.query.ordenesServicio.findFirst({
    where: (os, { eq }) => eq(os.empresaId, empresaId),
  });
  const clienteExistente = await db.query.clientes.findFirst({
    where: (cl, { eq }) => eq(cl.empresaId, empresaId),
  });

  if (viajeExistente && clienteExistente) {
    const guiaExistente = await db.query.guiasRemision.findFirst({
      where: (g, { eq }) => eq(g.ordenServicioId, viajeExistente.id),
    });

    if (!guiaExistente) {
      await db.insert(guiasRemision).values({
        empresaId,
        ordenServicioId: viajeExistente.id,
        tipoGuia: "GRE_TRANSPORTISTA_31",
        serie: "V001",
        numeroCorrelativo: 124,
        fechaEmision: "2026-09-08",
        fechaInicioTraslado: "2026-09-08",
        sunatTicketId: "SUNAT-TK-2026-89102",
        estadoSunat: "aceptado",
        sunatCodigoRespuesta: "0",
        sunatDescripcionRespuesta: "La Guía de Remisión Electrónica ha sido aceptada por SUNAT.",
        hashCpe: "UBL21-GRE-8A19F0E179BC",
        qrCode: "20601234567|31|V001|00000124|0.00|0.00|2026-09-08|6|20136284687|UBL21-GRE-8A19F0E179BC|",
        xmlFirmadoUrl: "https://storage.cargamaster.pe/xml/V001-00000124.xml",
        cdrXmlUrl: "https://storage.cargamaster.pe/cdr/R-V001-00000124.xml",
        pdfUrl: "https://storage.cargamaster.pe/pdf/V001-00000124.pdf",
      });
      console.log("✅ GRE V001-00000124 sembrada con éxito.");
    }

    const facturaExistente = await db.query.comprobantesPago.findFirst({
      where: (c, { eq }) => eq(c.ordenServicioId, viajeExistente.id),
    });

    if (!facturaExistente) {
      await db.insert(comprobantesPago).values({
        empresaId,
        ordenServicioId: viajeExistente.id,
        clienteId: clienteExistente.id,
        tipoComprobante: "01",
        serie: "F001",
        numeroCorrelativo: 412,
        fechaEmision: "2026-09-08",
        fechaVencimiento: "2026-10-08",
        moneda: "PEN",
        montoSubtotal: "7203.39",
        montoIgv: "1296.61",
        montoTotal: "8500.00",
        detraccionAplica: true,
        detraccionPorcentaje: "4.00",
        detraccionMonto: "340.00",
        cuentaBancoNacion: "00-018-294819",
        estadoPago: "pendiente",
        estadoSunat: "aceptado",
        sunatTicketId: "SUNAT-TK-2026-88401",
        sunatCodigoRespuesta: "0",
        sunatDescripcionRespuesta: "La Factura ha sido aceptada por SUNAT con CDR conforme.",
        hashCpe: "UBL21-FT-3B984A12891C",
        qrCode: "20601234567|01|F001|00000412|1296.61|8500.00|2026-09-08|6|20136284687|UBL21-FT-3B984A12891C|",
        xmlFirmadoUrl: "https://storage.cargamaster.pe/xml/F001-00000412.xml",
        cdrXmlUrl: "https://storage.cargamaster.pe/cdr/R-F001-00000412.xml",
        pdfUrl: "https://storage.cargamaster.pe/pdf/F001-00000412.pdf",
        observaciones: "Servicio de transporte de flete terrestre: Callao a Arequipa - Cerro Verde",
      });
      console.log("✅ Factura F001-00000412 con Detracción 4% sembrada con éxito.");
    }

    console.log("🏁 Base de datos verificada y actualizada con comprobantes.");
    return;
  }

  // 2. Sedes (Verificar existencia previa para evitar duplicados)
  let sedesList = await db.query.sedes.findMany({
    where: (s, { eq }) => eq(s.empresaId, empresaId),
  });

  if (sedesList.length === 0) {
    sedesList = await db
      .insert(sedes)
      .values([
        {
          empresaId,
          nombre: "Base Central y Patio Callao",
          codigoSunat: "0000",
          direccion: "Av. Néstor Gambetta Km 7.5",
          departamento: "Callao",
          provincia: "Callao",
          distrito: "Callao",
          ubigeo: "070101",
          telefono: "01-512-9801",
          esPrincipal: true,
        },
        {
          empresaId,
          nombre: "Terminal y Taller Arequipa",
          codigoSunat: "0001",
          direccion: "Variante de Uchumayo Km 4.2",
          departamento: "Arequipa",
          provincia: "Arequipa",
          distrito: "Sachaca",
          ubigeo: "040119",
          telefono: "054-289-400",
          esPrincipal: false,
        },
      ])
      .returning();
    console.log(`✅ 2 Sedes registradas (${sedesList[0].nombre}, ${sedesList[1].nombre})`);
  } else {
    console.log(`ℹ️ Sedes ya existentes (${sedesList.length} encontradas), omitiendo duplicados.`);
  }

  const sedeCallao = sedesList.find((s) => s.esPrincipal) || sedesList[0];
  const sedeArequipa = sedesList.find((s) => !s.esPrincipal) || sedesList[1] || sedesList[0];

  // 3. Usuarios Principales
  const dummyAdminId = "a0000000-0000-0000-0000-000000000001";
  const dummyDespachoId = "a0000000-0000-0000-0000-000000000002";

  await db.insert(usuarios).values([
    {
      id: dummyAdminId,
      empresaId,
      sedeId: sedeCallao.id,
      email: "admin@transandina.pe",
      nombres: "Carlos",
      apellidos: "Mendoza Silva",
      telefono: "998123456",
      rol: "admin",
      activo: true,
    },
    {
      id: dummyDespachoId,
      empresaId,
      sedeId: sedeCallao.id,
      email: "despacho@transandina.pe",
      nombres: "Renzo",
      apellidos: "Gutiérrez Vega",
      telefono: "987654321",
      rol: "despachador",
      activo: true,
    },
  ]);

  // 4. Flota: Tracto-Camiones
  const [tractoVolvo, tractoScania, tractoFreight] = await db
    .insert(unidades)
    .values([
      {
        empresaId,
        sedeId: sedeCallao.id,
        placa: "V7A-890",
        tipoUnidad: "tracto",
        marca: "Volvo",
        modelo: "FH 540 6x4 Globetrotter",
        anioFabricacion: 2023,
        color: "Blanco / Azul",
        vinChasis: "9BYS3A927PB128941",
        numeroMotor: "D13K540-109284",
        ejes: 3,
        capacidadArrastreTn: "48.00",
        pesoSecoTn: "8.90",
        tipoCombustible: "diesel_b5",
        odometroActualKm: 84520,
        idDispositivoGps: "IMEI-863920194827101",
        estado: "en_ruta",
      },
      {
        empresaId,
        sedeId: sedeCallao.id,
        placa: "B3C-912",
        tipoUnidad: "tracto",
        marca: "Scania",
        modelo: "R500 V8 6x4 Highline",
        anioFabricacion: 2022,
        color: "Rojo Rubí",
        vinChasis: "9BS4X2A88NB829103",
        numeroMotor: "DC16-500-88319",
        ejes: 3,
        capacidadArrastreTn: "52.00",
        pesoSecoTn: "9.10",
        tipoCombustible: "diesel_b5",
        odometroActualKm: 132400,
        idDispositivoGps: "IMEI-863920194827102",
        estado: "disponible",
      },
      {
        empresaId,
        sedeId: sedeArequipa.id,
        placa: "C8K-741",
        tipoUnidad: "tracto",
        marca: "Freightliner",
        modelo: "Cascadia 126 DD15",
        anioFabricacion: 2021,
        color: "Gris Plata",
        vinChasis: "3AKJHHDR8MS918234",
        numeroMotor: "DD15-475-72619",
        ejes: 3,
        capacidadArrastreTn: "45.00",
        pesoSecoTn: "8.60",
        tipoCombustible: "diesel_b5",
        odometroActualKm: 198300,
        idDispositivoGps: "IMEI-863920194827103",
        estado: "disponible",
      },
    ])
    .returning();

  console.log(`✅ 3 Tracto-camiones registrados: ${tractoVolvo.placa}, ${tractoScania.placa}, ${tractoFreight.placa}`);

  // 5. Semirremolques (Carretas)
  const [carretaPlataforma, carretaCisterna, carretaFurgon] = await db
    .insert(semirremolques)
    .values([
      {
        empresaId,
        placa: "Z1A-987",
        tipoCarroceria: "plataforma",
        marca: "Montenegro",
        anioFabricacion: 2023,
        ejes: 3,
        pesoNetoTn: "6.80",
        cargaUtilMaxTn: "32.00",
        volumenM3: "0.00",
        estado: "acoplado",
      },
      {
        empresaId,
        placa: "W2B-654",
        tipoCarroceria: "cisterna",
        marca: "Randon",
        anioFabricacion: 2022,
        ejes: 3,
        pesoNetoTn: "8.40",
        cargaUtilMaxTn: "28.00",
        volumenM3: "34.00", // ~9,000 galones
        estado: "disponible",
      },
      {
        empresaId,
        placa: "F9C-321",
        tipoCarroceria: "furgon",
        marca: "Facchini",
        anioFabricacion: 2023,
        ejes: 3,
        pesoNetoTn: "7.90",
        cargaUtilMaxTn: "30.00",
        volumenM3: "92.00",
        estado: "disponible",
      },
    ])
    .returning();

  console.log(`✅ 3 Semirremolques registrados: ${carretaPlataforma.placa}, ${carretaCisterna.placa}, ${carretaFurgon.placa}`);

  // 6. Acoplamiento Activo (Volvo V7A-890 ↔ Plataforma Z1A-987)
  await db.insert(asignacionesTractoCarreta).values({
    empresaId,
    unidadId: tractoVolvo.id,
    semirremolqueId: carretaPlataforma.id,
    observaciones: "Acople verificado en patio Callao para ruta Minera",
    activo: true,
  });

  // 7. Documentos Vehiculares (SOAT, RT, MTC)
  await db.insert(documentosVehiculo).values([
    {
      empresaId,
      entidadTipo: "unidad",
      entidadId: tractoVolvo.id,
      tipoDocumento: "soat",
      numeroDocumento: "SOAT-RIMAC-2026-9921",
      empresaEmisora: "Rímac Seguros",
      fechaEmision: "2026-01-10",
      fechaVencimiento: "2027-01-10",
      estadoAlerta: "vigente",
    },
    {
      empresaId,
      entidadTipo: "unidad",
      entidadId: tractoVolvo.id,
      tipoDocumento: "revision_tecnica",
      numeroDocumento: "CITV-LIDERCON-2025-4412",
      empresaEmisora: "Lidercon Perú CITV",
      fechaEmision: "2025-09-20",
      fechaVencimiento: "2026-09-20", // Vence pronto (~11 días)
      estadoAlerta: "por_vencer",
    },
    {
      empresaId,
      entidadTipo: "unidad",
      entidadId: tractoVolvo.id,
      tipoDocumento: "tarjeta_circulacion_mtc",
      numeroDocumento: "TUC-MTC-PE-889123",
      empresaEmisora: "MTC Dirección de Transporte Terrestre",
      fechaEmision: "2024-03-15",
      fechaVencimiento: "2028-03-15",
      estadoAlerta: "vigente",
    },
  ]);

  // 8. Conductores con Categoría A-IIIc (Pesado articulado)
  const [chofer1, chofer2] = await db
    .insert(conductores)
    .values([
      {
        empresaId,
        tipoDocumento: "dni",
        numeroDocumento: "42819204",
        nombres: "Wilfredo",
        apellidos: "Quispe Mamani",
        telefono: "951908273",
        contactoEmergencia: "Rosa Mamani (Esposa)",
        telefonoEmergencia: "951908274",
        grupoSanguineo: "O+",
        estado: "en_viaje",
      },
      {
        empresaId,
        tipoDocumento: "dni",
        numeroDocumento: "45019284",
        nombres: "Edgar",
        apellidos: "Huamán Condori",
        telefono: "984102938",
        contactoEmergencia: "Gloria Condori",
        telefonoEmergencia: "984102939",
        grupoSanguineo: "A+",
        estado: "disponible",
      },
    ])
    .returning();

  // Licencias MTC
  await db.insert(licenciasConductor).values([
    {
      conductorId: chofer1.id,
      categoria: "A-IIIc",
      numeroLicencia: "Q42819204",
      fechaExpedicion: "2018-05-10",
      fechaRevalidacion: "2027-05-10",
      puntosAcumuladosMtc: 0,
      estado: "vigente",
    },
    {
      conductorId: chofer2.id,
      categoria: "A-IIIc",
      numeroLicencia: "H45019284",
      fechaExpedicion: "2019-11-20",
      fechaRevalidacion: "2026-10-15", // Próximo a vencer
      puntosAcumuladosMtc: 20,
      estado: "por_vencer",
    },
  ]);

  // Certificaciones MTC (MATPEL y Seguridad Vial)
  await db.insert(certificacionesConductor).values([
    {
      conductorId: chofer1.id,
      tipo: "mercancias_peligrosas_matpel",
      entidadCapacitadora: "ESCUELA DE CONDUCTORES INTEGRAL DEL PERÚ",
      numeroCertificado: "MATPEL-2025-1092",
      fechaEmision: "2025-06-01",
      fechaVencimiento: "2028-06-01",
      estado: "vigente",
    },
    {
      conductorId: chofer1.id,
      tipo: "curso_seguridad_vial_mtc",
      entidadCapacitadora: "CENTRO DE CAPACITACION SUTRAN - MTC",
      numeroCertificado: "RD-MTC-2024-817",
      fechaEmision: "2024-08-10",
      fechaVencimiento: "2026-08-10",
      estado: "vigente",
    },
  ]);

  // 9. Clientes Industriales
  const [clienteMinera, clienteConsumo] = await db
    .insert(clientes)
    .values([
      {
        empresaId,
        tipoDocumento: "ruc",
        numeroDocumento: "20136284687",
        razonSocial: "SOCIEDAD MINERA CERRO VERDE S.A.A.",
        direccionFiscal: "Asiento Minero Cerro Verde s/n, Uchumayo, Arequipa",
        departamento: "Arequipa",
        provincia: "Arequipa",
        distrito: "Uchumayo",
        ubigeo: "040126",
        contactoNombre: "Ing. Marco Aurelio Benavides",
        contactoTelefono: "054-381-000",
        contactoEmail: "logistica@cerroverde.pe",
        condicionPagoDias: "30_dias",
      },
      {
        empresaId,
        tipoDocumento: "ruc",
        numeroDocumento: "20100055237",
        razonSocial: "ALICORP S.A.A.",
        direccionFiscal: "Av. Argentina 4793, Carmen de la Legua Reynoso, Callao",
        departamento: "Callao",
        provincia: "Callao",
        distrito: "Carmen de la Legua",
        ubigeo: "070102",
        contactoNombre: "Lic. Andrea Morales",
        contactoTelefono: "01-315-0800",
        contactoEmail: "despachos@alicorp.com.pe",
        condicionPagoDias: "45_dias",
      },
    ])
    .returning();

  // 10. Rutas Frecuentes
  const [rutaSur, rutaCentro] = await db
    .insert(rutas)
    .values([
      {
        empresaId,
        codigoRuta: "LIM-AQP-01",
        nombre: "Callao Puerto ➔ Arequipa (Cerro Verde) por Panamericana Sur",
        origenDepartamento: "Callao",
        origenProvincia: "Callao",
        origenDistrito: "Callao",
        origenUbigeo: "070101",
        origenDireccion: "APM Terminals / DP World Callao",
        destinoDepartamento: "Arequipa",
        destinoProvincia: "Arequipa",
        destinoDistrito: "Uchumayo",
        destinoUbigeo: "040126",
        destinoDireccion: "Mina Cerro Verde Garita Principal",
        distanciaEstimadaKm: "1018.00",
        tiempoEstimadoHoras: "17.50",
        peajesEstimadosMonto: "340.00",
        galonesEstimados: "165.00",
      },
      {
        empresaId,
        codigoRuta: "LIM-HYO-02",
        nombre: "Lima Puerto ➔ Huancayo por Carretera Central",
        origenDepartamento: "Lima",
        origenProvincia: "Lima",
        origenDistrito: "Ate",
        origenUbigeo: "150103",
        origenDireccion: "Centro Logístico Lurín / Santa Anita",
        destinoDepartamento: "Junín",
        destinoProvincia: "Huancayo",
        destinoDistrito: "El Tambo",
        destinoUbigeo: "120114",
        destinoDireccion: "Almacenes Centrales El Tambo",
        distanciaEstimadaKm: "315.00",
        tiempoEstimadoHoras: "9.00",
        peajesEstimadosMonto: "115.00",
        galonesEstimados: "75.00",
      },
    ])
    .returning();

  // 11. Órdenes de Servicio (Viaje en Ruta Actual)
  const [viajeEnRuta] = await db
    .insert(ordenesServicio)
    .values([
      {
        empresaId,
        codigoViaje: "OS-2026-00042",
        clienteId: clienteMinera.id,
        rutaId: rutaSur.id,
        unidadId: tractoVolvo.id,
        semirremolqueId: carretaPlataforma.id,
        conductorId: chofer1.id,
        tipoCarga: "maquinaria",
        descripcionCarga: "Bolas de molienda de acero y repuestos de chancadora primaria",
        pesoBrutoKg: "29500.00",
        unidadMedida: "KGM",
        fechaHoraProgramada: new Date("2026-09-08T06:00:00Z"),
        fechaHoraInicio: new Date("2026-09-08T08:30:00Z"),
        odometroInicio: 83500,
        estado: "en_ruta",
        fletePactadoMoneda: "PEN",
        fletePactadoMonto: "8500.00",
        detraccionPorcentaje: "4.00",
        detraccionMonto: "340.00",
        adelantoViaticos: "1200.00",
        observaciones: "Carga pesada con sujeción mediante fajas y cadenas certificadas",
      },
    ])
    .returning();

  // Trazabilidad de estados del viaje
  await db.insert(historialEstadosViaje).values([
    {
      ordenServicioId: viajeEnRuta.id,
      estadoAnterior: "programado",
      estadoNuevo: "cargando",
      observacion: "Ingreso a puerto APM Terminals para carga",
    },
    {
      ordenServicioId: viajeEnRuta.id,
      estadoAnterior: "cargando",
      estadoNuevo: "en_ruta",
      observacion: "Salida de balanza puerto con precinto de seguridad MTC N° 9812",
    },
  ]);

  // Telemetría GPS en tiempo real (Unidad V7A-890 pasando por Nazca / Panamericana Sur)
  await db.insert(posicionesTelemetria).values([
    {
      empresaId,
      unidadId: tractoVolvo.id,
      ordenServicioId: viajeEnRuta.id,
      latitud: "-14.828889",
      longitud: "-74.943611",
      velocidadKmh: "72.40",
      rumboGrados: 145,
      ignicion: true,
      odometroKm: 84120,
      nivelCombustiblePct: "64.00",
      proveedorGps: "teltonika_fmb",
      timestampDispositivo: new Date(),
    },
  ]);

  // Alerta preventiva de vencimiento
  await db.insert(alertasSistema).values([
    {
      empresaId,
      categoria: "vencimiento_documento",
      severidad: "warning",
      titulo: "Revisión Técnica por vencer en Unidad V7A-890",
      mensaje: "El Certificado de Inspección Técnica Vehicular vence el 20/09/2026 (en 11 días). Coordinar cita con Lidercon.",
      referenciaTipo: "unidad",
      referenciaId: tractoVolvo.id,
      resuelta: false,
    },
    {
      empresaId,
      categoria: "vencimiento_documento",
      severidad: "warning",
      titulo: "Licencia de Conducir de Edgar Huamán por vencer",
      mensaje: "La licencia A-IIIc revalida el 15/10/2026. Conductor acumula 20 puntos en MTC.",
      referenciaTipo: "conductor",
      referenciaId: chofer2.id,
      resuelta: false,
    },
  ]);

  // Consumo de combustible en ruta (Chala - Arequipa)
  await db.insert(consumoCombustible).values({
    empresaId,
    ordenServicioId: viajeEnRuta.id,
    unidadId: tractoVolvo.id,
    conductorId: chofer1.id,
    grifoNombre: "ESTACION DE SERVICIOS CHALA SUR E.I.R.L. - REPSOL",
    grifoRuc: "20541092819",
    numeroValeComprobante: "F001-00049182",
    galonesCargados: "90.00",
    precioPorGalon: "17.80",
    totalMonto: "1602.00",
    odometroAlCargar: 84010,
    rendimientoKmGalonCalculado: "5.67",
  });

  // Guía de Remisión Electrónica (GRE-Transportista SUNAT 31)
  await db.insert(guiasRemision).values({
    empresaId,
    ordenServicioId: viajeEnRuta.id,
    tipoGuia: "GRE_TRANSPORTISTA_31",
    serie: "V001",
    numeroCorrelativo: 124,
    fechaEmision: "2026-09-08",
    fechaInicioTraslado: "2026-09-08",
    sunatTicketId: "SUNAT-TK-2026-89102",
    estadoSunat: "aceptado",
    sunatCodigoRespuesta: "0",
    sunatDescripcionRespuesta: "La Guía de Remisión Electrónica ha sido aceptada por SUNAT.",
    hashCpe: "UBL21-GRE-8A19F0E179BC",
    qrCode: "20601234567|31|V001|00000124|0.00|0.00|2026-09-08|6|20136284687|UBL21-GRE-8A19F0E179BC|",
    xmlFirmadoUrl: "https://storage.cargamaster.pe/xml/V001-00000124.xml",
    cdrXmlUrl: "https://storage.cargamaster.pe/cdr/R-V001-00000124.xml",
    pdfUrl: "https://storage.cargamaster.pe/pdf/V001-00000124.pdf",
  });

  // Factura Electrónica con Detracción SPOT 4% (F001-000412)
  await db.insert(comprobantesPago).values({
    empresaId,
    ordenServicioId: viajeEnRuta.id,
    clienteId: clienteMinera.id,
    tipoComprobante: "01",
    serie: "F001",
    numeroCorrelativo: 412,
    fechaEmision: "2026-09-08",
    fechaVencimiento: "2026-10-08",
    moneda: "PEN",
    montoSubtotal: "7203.39",
    montoIgv: "1296.61",
    montoTotal: "8500.00",
    detraccionAplica: true,
    detraccionPorcentaje: "4.00",
    detraccionMonto: "340.00",
    cuentaBancoNacion: "00-018-294819",
    estadoPago: "pendiente",
    estadoSunat: "aceptado",
    sunatTicketId: "SUNAT-TK-2026-88401",
    sunatCodigoRespuesta: "0",
    sunatDescripcionRespuesta: "La Factura ha sido aceptada por SUNAT con CDR conforme.",
    hashCpe: "UBL21-FT-3B984A12891C",
    qrCode: "20601234567|01|F001|00000412|1296.61|8500.00|2026-09-08|6|20136284687|UBL21-FT-3B984A12891C|",
    xmlFirmadoUrl: "https://storage.cargamaster.pe/xml/F001-00000412.xml",
    cdrXmlUrl: "https://storage.cargamaster.pe/cdr/R-F001-00000412.xml",
    pdfUrl: "https://storage.cargamaster.pe/pdf/F001-00000412.pdf",
    observaciones: "Servicio de transporte de flete terrestre: Callao a Arequipa - Cerro Verde",
  });

  console.log("🏁 Seeding de CargaMaster Pro completado con éxito.");
}

// Ejecutar si es llamado directamente
if (require.main === module || process.argv[1]?.includes("seed.ts")) {
  runSeed()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error en seed:", err);
      process.exit(1);
    });
}
