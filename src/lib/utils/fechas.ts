/**
 * Utilidades para cálculo de vigencias y semáforo regulatorio (MTC / SUTRAN / SOAT)
 */

export function calcularEstadoAlerta(fechaVencimientoStr: string): {
  estado: "vigente" | "por_vencer" | "vencido";
  diasRestantes: number;
} {
  const vencimiento = new Date(fechaVencimientoStr + "T00:00:00");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffTime = vencimiento.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diasRestantes <= 0) {
    return { estado: "vencido", diasRestantes };
  } else if (diasRestantes <= 30) {
    return { estado: "por_vencer", diasRestantes };
  }
  return { estado: "vigente", diasRestantes };
}
