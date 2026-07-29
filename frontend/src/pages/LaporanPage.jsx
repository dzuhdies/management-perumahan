import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";
import { formatRupiah, formatTanggal, getErrorMessage, namaBulan } from "../utils/format.js";

const sekarang = new Date();
const tahunSekarang = sekarang.getFullYear();
const bulanSekarang = `${tahunSekarang}-${String(sekarang.getMonth() + 1).padStart(2, "0")}`;
const tigaBulanLalu = new Date(tahunSekarang, sekarang.getMonth() - 2, 1);
const bulanTigaBulanLalu = `${tigaBulanLalu.getFullYear()}-${String(tigaBulanLalu.getMonth() + 1).padStart(2, "0")}`;
const emptySummary = { pemasukan: 0, pengeluaran: 0, saldo: 0, saldo_total: 0 };
const pilihanTahun = Array.from({ length: 12 }, (_, index) => tahunSekarang + 1 - index);

function formatPeriode(value) {
  if (!value) return "-";
  const [tahun, bulan] = value.split("-").map(Number);
  return `${namaBulan[bulan]} ${tahun}`;
}

function setBagianPeriode(value, bagian, nextValue) {
  const [tahun, bulan] = value.split("-");
  return bagian === "tahun"
    ? `${nextValue}-${bulan}`
    : `${tahun}-${String(nextValue).padStart(2, "0")}`;
}

function LaporanPage() {
  const [rentang, setRentang] = useState("ytd");
  const [customDari, setCustomDari] = useState(bulanTigaBulanLalu);
  const [customSampai, setCustomSampai] = useState(bulanSekarang);
  const [summary, setSummary] = useState(emptySummary);
  const [grafik, setGrafik] = useState([]);
  const [detail, setDetail] = useState({ pemasukan: [], pengeluaran: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (rentang === "custom" && customDari > customSampai) {
      setError("Periode akhir harus sama atau setelah periode awal.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const params = {
        rentang,
        ...(rentang === "custom" && {
          dari: customDari,
          sampai: customSampai,
        }),
      };
      const [summaryResponse, grafikResponse, detailResponse] = await Promise.all([
        api.get("/laporan/summary", { params }),
        api.get("/laporan/grafik", { params }),
        api.get("/laporan/detail", { params }),
      ]);

      setSummary(summaryResponse.data?.data ?? emptySummary);
      setGrafik(grafikResponse.data?.data ?? []);
      setDetail(detailResponse.data?.data ?? { pemasukan: [], pengeluaran: [] });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [rentang, customDari, customSampai]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const labelRentang = rentang === "custom"
    ? `${formatPeriode(customDari)} – ${formatPeriode(customSampai)}`
    : {
      "1_bulan": "1 bulan terakhir",
      "3_bulan": "3 bulan terakhir",
      ytd: `Year to Date ${tahunSekarang}`,
    }[rentang];

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Ringkasan data</p>
          <h2>Laporan</h2>
          <p>Lihat pemasukan, pengeluaran, dan saldo berdasarkan rentang yang dipilih.</p>
        </div>
      </header>

      <div className={`report-total-balance ${Number(summary.saldo_total) < 0 ? "negative" : ""}`}>
        <span>Total saldo seluruh kas</span>
        <strong>{formatRupiah(summary.saldo_total)}</strong>
        <small>{Number(summary.saldo_total) < 0 ? "Saldo keseluruhan defisit" : "Saldo kas yang masih tersedia"}</small>
      </div>

      <div className="report-filter-panel">
        <div>
          <span className="report-filter-label">Rentang laporan</span>
          <div className="chart-range-buttons" aria-label="Filter rentang laporan">
            {[
              ["1_bulan", "1 Bulan"],
              ["3_bulan", "3 Bulan"],
              ["ytd", "Year to Date"],
              ["custom", "Custom"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={rentang === value ? "active" : ""}
                type="button"
                onClick={() => setRentang(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {rentang === "custom" && (
          <div className="custom-period-picker">
            <PeriodSelect
              label="Dari"
              value={customDari}
              onChange={setCustomDari}
            />
            <span className="period-separator">—</span>
            <PeriodSelect
              label="Sampai"
              value={customSampai}
              onChange={setCustomSampai}
            />
          </div>
        )}

        <div className="active-period-label">
          <span>Periode aktif</span>
          <strong>{labelRentang}</strong>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <div className="page-loading">Memuat laporan...</div> : (
        <>
          <div className="finance-grid">
            <article className="finance-card">
              <p>Total pemasukan</p>
              <h3>{formatRupiah(summary.pemasukan)}</h3>
              <span>{labelRentang}</span>
            </article>
            <article className="finance-card">
              <p>Total pengeluaran</p>
              <h3>{formatRupiah(summary.pengeluaran)}</h3>
              <span>{labelRentang}</span>
            </article>
            <article className={`finance-card balance ${Number(summary.saldo) < 0 ? "negative" : ""}`}>
              <p>Total saldo</p>
              <h3>{formatRupiah(summary.saldo)}</h3>
              <span>{Number(summary.saldo) < 0 ? "Defisit pada periode ini" : "Surplus pada periode ini"}</span>
            </article>
          </div>

          <div className="panel chart-panel">
            <div className="panel-heading chart-heading">
              <div>
                <h3>Tren keuangan</h3>
                <p>{labelRentang} · garis saldo dapat berada di bawah nol ketika terjadi defisit.</p>
              </div>
              <div className="chart-legend">
                <span className="income-dot">Pemasukan</span>
                <span className="expense-dot">Pengeluaran</span>
                <span className="balance-dot">Saldo</span>
              </div>
            </div>
            <LineChart data={grafik} />
          </div>

          <div className="report-detail-grid">
            <div className="panel report-detail-panel">
              <div className="panel-heading">
                <div><h3>Detail pemasukan</h3><p>Pembayaran iuran selama {labelRentang}.</p></div>
                <strong className="report-total income-text">{formatRupiah(summary.pemasukan)}</strong>
              </div>
              <div className="table-card compact-table">
                <table>
                  <thead><tr><th>Tanggal</th><th>Periode</th><th>Rumah / Penghuni</th><th>Iuran</th><th>Nominal</th></tr></thead>
                  <tbody>
                    {detail.pemasukan?.map((item) => (
                      <tr key={item.id}>
                        <td>{formatTanggal(item.tanggal_bayar)}</td>
                        <td>{namaBulan[item.bulan]} {item.tahun}</td>
                        <td><strong>{item.riwayat_penghuni?.rumah?.kode_rumah || "-"}</strong><small>{item.riwayat_penghuni?.penghuni?.nama_lengkap || "-"}</small></td>
                        <td>{item.jenis_iuran?.nama_iuran || "-"}</td>
                        <td>{formatRupiah(item.nominal_dibayar)}</td>
                      </tr>
                    ))}
                    {!detail.pemasukan?.length && <tr><td className="table-empty" colSpan="5">Belum ada pemasukan pada periode ini.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel report-detail-panel">
              <div className="panel-heading">
                <div><h3>Detail pengeluaran</h3><p>Penggunaan kas selama {labelRentang}.</p></div>
                <strong className="report-total expense-text">{formatRupiah(summary.pengeluaran)}</strong>
              </div>
              <div className="table-card compact-table">
                <table>
                  <thead><tr><th>Tanggal</th><th>Keperluan</th><th>Nominal</th></tr></thead>
                  <tbody>
                    {detail.pengeluaran?.map((item) => (
                      <tr key={item.id}>
                        <td>{formatTanggal(item.tanggal_pengeluaran)}</td>
                        <td><strong>{item.judul}</strong><small>{item.deskripsi || "Tanpa keterangan"}</small></td>
                        <td>{formatRupiah(item.nominal)}</td>
                      </tr>
                    ))}
                    {!detail.pengeluaran?.length && <tr><td className="table-empty" colSpan="3">Belum ada pengeluaran pada periode ini.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function PeriodSelect({ label, value, onChange }) {
  const [tahun, bulan] = value.split("-");

  return (
    <fieldset className="period-select">
      <legend>{label}</legend>
      <label>
        Bulan
        <select
          aria-label={`Bulan ${label.toLowerCase()}`}
          value={Number(bulan)}
          onChange={(event) => onChange(setBagianPeriode(value, "bulan", event.target.value))}
        >
          {namaBulan.slice(1).map((nama, index) => (
            <option key={nama} value={index + 1}>{nama}</option>
          ))}
        </select>
      </label>
      <label>
        Tahun
        <select
          aria-label={`Tahun ${label.toLowerCase()}`}
          value={Number(tahun)}
          onChange={(event) => onChange(setBagianPeriode(value, "tahun", event.target.value))}
        >
          {pilihanTahun.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
    </fieldset>
  );
}

function LineChart({ data }) {
  if (!data.length) {
    return <div className="chart-loading">Belum ada data pada rentang ini.</div>;
  }

  const width = 1000;
  const height = 350;
  const padding = { top: 24, right: 24, bottom: 48, left: 72 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.flatMap((item) => [
    Number(item.pemasukan),
    Number(item.pengeluaran),
    Number(item.saldo),
  ]);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const valueRange = Math.max(1, maxValue - minValue);
  const xPosition = (index) => data.length === 1
    ? padding.left + chartWidth / 2
    : padding.left + (index / (data.length - 1)) * chartWidth;
  const yPosition = (value) => padding.top + ((maxValue - Number(value)) / valueRange) * chartHeight;
  const points = (key) => data.map((item, index) => ({
    x: xPosition(index),
    y: yPosition(item[key]),
    value: Number(item[key]),
    item,
  }));
  const path = (series) => series.map(
    (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
  ).join(" ");
  const series = [
    { key: "pemasukan", type: "income", label: "Pemasukan", points: points("pemasukan") },
    { key: "pengeluaran", type: "expense", label: "Pengeluaran", points: points("pengeluaran") },
    { key: "saldo", type: "balance", label: "Saldo", points: points("saldo") },
  ];
  const labelStep = Math.max(1, Math.ceil(data.length / 8));
  const compactCurrency = (value) => new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

  return (
    <div className="line-chart-wrap">
      <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafik garis pemasukan, pengeluaran, dan saldo">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = minValue + valueRange * ratio;
          const y = yPosition(value);
          return (
            <g key={ratio}>
              <line className={`chart-grid-line ${Math.abs(value) < valueRange * 0.01 ? "zero" : ""}`} x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              <text className="chart-axis-value" x={padding.left - 12} y={y + 4} textAnchor="end">
                {compactCurrency(value)}
              </text>
            </g>
          );
        })}

        {minValue < 0 && maxValue > 0 && (
          <line className="chart-zero-line" x1={padding.left} x2={width - padding.right} y1={yPosition(0)} y2={yPosition(0)} />
        )}

        {series.map((item) => (
          <path key={item.key} className={`chart-line chart-line-${item.type}`} d={path(item.points)} />
        ))}

        {series.map((item) => item.points.map((point) => (
          <circle
            key={`${item.type}-${point.item.periode}`}
            className={`chart-point chart-point-${item.type}`}
            cx={point.x}
            cy={point.y}
            r="5"
          >
            <title>{item.label} {namaBulan[point.item.bulan]} {point.item.tahun}: {formatRupiah(point.value)}</title>
          </circle>
        )))}

        {data.map((item, index) => (
          (index % labelStep === 0 || index === data.length - 1) && (
            <text
              key={item.periode}
              className="chart-axis-label"
              x={xPosition(index)}
              y={height - 17}
              textAnchor="middle"
            >
              {namaBulan[item.bulan].slice(0, 3)} {String(item.tahun).slice(-2)}
            </text>
          )
        ))}
      </svg>
    </div>
  );
}

export default LaporanPage;
