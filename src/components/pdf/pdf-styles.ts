import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 28,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  // Encabezado institucional
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0F172A",
    paddingBottom: 8,
    marginBottom: 10,
  },
  companyBox: {
    width: "60%",
  },
  companyName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  companySub: {
    fontSize: 7.5,
    color: "#475569",
    marginTop: 2,
  },
  docCodeBox: {
    width: "38%",
    borderWidth: 1.5,
    borderColor: "#0F172A",
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  docRuc: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#B45309",
    textAlign: "center",
    textTransform: "uppercase",
  },
  docSubtitle: {
    fontSize: 7,
    color: "#64748B",
    textAlign: "center",
    marginTop: 1,
  },
  docCorrelativo: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginTop: 4,
  },

  // Cajas y secciones
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionBadge: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#FDE68A",
    marginLeft: "auto",
  },

  // Grid de columnas
  row: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  col2: {
    width: "50%",
  },
  col3: {
    width: "33.33%",
  },
  col4: {
    width: "25%",
  },

  // Cajas de información
  card: {
    borderWidth: 0.75,
    borderColor: "#CBD5E1",
    borderRadius: 3,
    padding: 5,
    backgroundColor: "#FFFFFF",
  },
  cardFilled: {
    borderWidth: 0.75,
    borderColor: "#E2E8F0",
    borderRadius: 3,
    padding: 5,
    backgroundColor: "#F8FAFC",
  },
  label: {
    fontSize: 6.5,
    color: "#64748B",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 1.5,
  },
  value: {
    fontSize: 8,
    color: "#0F172A",
    fontFamily: "Helvetica",
  },
  valueBold: {
    fontSize: 8,
    color: "#0F172A",
    fontFamily: "Helvetica-Bold",
  },
  valueHighlight: {
    fontSize: 8.5,
    color: "#B45309",
    fontFamily: "Helvetica-Bold",
  },

  // Tabla
  table: {
    borderWidth: 0.75,
    borderColor: "#CBD5E1",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 0.75,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#334155",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 3.5,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 7.5,
    color: "#1E293B",
  },

  // Código QR y verificación
  qrContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.75,
    borderColor: "#CBD5E1",
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#F8FAFC",
    gap: 8,
  },
  qrImage: {
    width: 60,
    height: 60,
  },
  qrText: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  qrDesc: {
    fontSize: 6.5,
    color: "#475569",
    lineHeight: 1.3,
  },

  // Firmas y sellos
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 8,
  },
  signatureBox: {
    width: "30%",
    borderTopWidth: 1,
    borderTopColor: "#475569",
    paddingTop: 4,
    alignItems: "center",
  },
  signatureTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#334155",
    textAlign: "center",
  },
  signatureSub: {
    fontSize: 6,
    color: "#64748B",
    textAlign: "center",
    marginTop: 1,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#E2E8F0",
    paddingTop: 4,
    fontSize: 6.5,
    color: "#94A3B8",
  },
});
