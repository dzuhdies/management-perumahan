export const namaBulan = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getApiList(response) {
  const payload = response.data?.data ?? response.data;
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}

export function getErrorMessage(error) {
  const errors = error.response?.data?.errors;

  if (errors) {
    return Object.values(errors).flat().join(" ");
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "Terjadi kesalahan. Silakan coba lagi."
  );
}
