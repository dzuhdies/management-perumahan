import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import api from "../services/api.js";
import { formatRupiah, getErrorMessage, namaBulan } from "../utils/format.js";

const sekarang = new Date();
const tahunSekarang = sekarang.getFullYear();
const bulanSekarang = `${tahunSekarang}-${String(sekarang.getMonth() + 1).padStart(2, "0")}`;
const tigaBulanLalu = new Date(tahunSekarang, sekarang.getMonth() - 2, 1);
const bulanTigaBulanLalu = `${tigaBulanLalu.getFullYear()}-${String(tigaBulanLalu.getMonth() + 1).padStart(2, "0")}`;
const pilihanTahun = Array.from({ length: 12 }, (_, index) => tahunSekarang + 1 - index);

const initialDashboard = {
  periode: { bulan: 0, tahun: 0 },
  rumah: { total: 0, dihuni: 0, kosong: 0 },
  rumah_penghuni: [],
  penghuni: { total: 0 },
  tagihan: {
    lunas: 0,
    belum_lunas: 0,
    sudah_generate: false,
    belum_lunas_detail: [],
  },
  keuangan: {
    pemasukan_bulan_ini: 0,
    pengeluaran_bulan_ini: 0,
    saldo_bulan_ini: 0,
    total_pemasukan: 0,
    total_pengeluaran: 0,
    saldo_total: 0,
  },
  grafik_saldo: [],
};

const today = () => new Date().toISOString().slice(0, 10);

function formatPeriode(value) {
  const [tahun, bulan] = value.split("-").map(Number);
  return `${namaBulan[bulan]} ${tahun}`;
}

function setBagianPeriode(value, bagian, nextValue) {
  const [tahun, bulan] = value.split("-");
  return bagian === "tahun"
    ? `${nextValue}-${bulan}`
    : `${tahun}-${String(nextValue).padStart(2, "0")}`;
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [rentang, setRentang] = useState("3_bulan");
  const [customDari, setCustomDari] = useState(bulanTigaBulanLalu);
  const [customSampai, setCustomSampai] = useState(bulanSekarang);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchDashboard = useCallback(async () => {
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
      const response = await api.get("/dashboard", { params });
      setDashboard({
        ...initialDashboard,
        ...(response.data?.data || {}),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [rentang, customDari, customSampai]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  async function bayar(tagihan) {
    if (!window.confirm(`Bayar ${tagihan.jenis_iuran} milik ${tagihan.penghuni} sebesar ${formatRupiah(tagihan.nominal)}?`)) {
      return;
    }

    try {
      setWorkingId(tagihan.id);
      setError("");
      await api.post("/tagihan/bayar", {
        riwayat_penghuni_id: tagihan.riwayat_penghuni_id,
        jenis_iuran_id: tagihan.jenis_iuran_id,
        bulan: tagihan.bulan,
        tahun: tagihan.tahun,
        jumlah_bulan: 1,
        tanggal_bayar: today(),
      });
      setNotice(`Pembayaran ${tagihan.jenis_iuran} untuk rumah ${tagihan.rumah} berhasil.`);
      await fetchDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setWorkingId(null);
    }
  }

  const periodeBulanIni = dashboard.periode.bulan
    ? `${namaBulan[dashboard.periode.bulan]} ${dashboard.periode.tahun}`
    : "-";
  const labelGrafik = rentang === "custom"
    ? `${formatPeriode(customDari)} – ${formatPeriode(customSampai)}`
    : {
      "1_bulan": "1 bulan terakhir",
      "3_bulan": "3 bulan terakhir",
      "6_bulan": "6 bulan terakhir",
      "1_tahun": "1 tahun terakhir",
    }[rentang];

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
        </div>
        <button className="button button-ghost" type="button" onClick={fetchDashboard} disabled={loading}>
          <RefreshCw size={16} /> {loading ? "Memuat..." : "Muat ulang"}
        </button>
      </header>

      {error && <div className="alert alert-error"><AlertCircle size={18} />{error}</div>}
      {notice && <div className="alert alert-success"><CheckCircle2 size={18} />{notice}</div>}

      <div className="dashboard-finance-grid">
        <article className={`dashboard-balance-card ${Number(dashboard.keuangan.saldo_total) < 0 ? "negative" : ""}`}>
          <span>Total saldo tersisa</span>
          <strong>{formatRupiah(dashboard.keuangan.saldo_total)}</strong>
          <small>
            Pemasukan {formatRupiah(dashboard.keuangan.total_pemasukan)}
            {" · "}
            Pengeluaran {formatRupiah(dashboard.keuangan.total_pengeluaran)}
          </small>
        </article>
        <article className="finance-card">
          <p>Pemasukan bulanan</p>
          <h3>{formatRupiah(dashboard.keuangan.pemasukan_bulan_ini)}</h3>
          <span>{periodeBulanIni}</span>
        </article>
        <article className="finance-card">
          <p>Pengeluaran bulanan</p>
          <h3>{formatRupiah(dashboard.keuangan.pengeluaran_bulan_ini)}</h3>
          <span>{periodeBulanIni}</span>
        </article>
      </div>

      <div className="panel dashboard-chart-panel">
        <div className="panel-heading">
          <div>
            <h3>Grafik total saldo</h3>
            <p>{labelGrafik} · saldo kas kumulatif pada akhir setiap bulan.</p>
          </div>
          <span className="dashboard-chart-current">
            Saldo sekarang <strong>{formatRupiah(dashboard.keuangan.saldo_total)}</strong>
          </span>
        </div>

        <div className="dashboard-chart-filter">
          <div className="chart-range-buttons" aria-label="Filter grafik saldo dashboard">
            {[
              ["1_bulan", "1 Bulan"],
              ["3_bulan", "3 Bulan"],
              ["6_bulan", "6 Bulan"],
              ["1_tahun", "1 Tahun"],
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

          {rentang === "custom" && (
            <div className="custom-period-picker dashboard-custom-period">
              <PeriodSelect label="Dari" value={customDari} onChange={setCustomDari} />
              <span className="period-separator">—</span>
              <PeriodSelect label="Sampai" value={customSampai} onChange={setCustomSampai} />
            </div>
          )}
        </div>

        {loading
          ? <div className="chart-loading">Memuat grafik saldo...</div>
          : <BalanceChart data={dashboard.grafik_saldo} />}
      </div>

      <div className="dashboard-widget-grid">
        <div className="panel dashboard-widget">
          <div className="panel-heading">
            <div>
              <h3>Rumah dan penghuni</h3>
              <p>{dashboard.rumah.dihuni} dihuni · {dashboard.rumah.kosong} kosong</p>
            </div>
            <strong>{dashboard.rumah.total} rumah</strong>
          </div>
          <div className="dashboard-list-scroll">
            <table>
              <thead><tr><th>No. rumah</th><th>Penghuni aktif</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard.rumah_penghuni.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.kode_rumah}</strong></td>
                    <td>{item.penghuni || "Belum ada penghuni"}</td>
                    <td><span className={`badge ${item.penghuni ? "badge-success" : "badge-neutral"}`}>{item.penghuni ? "Dihuni" : "Kosong"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel dashboard-widget">
          <div className="panel-heading">
            <div>
              <h3>Tagihan belum lunas</h3>
              <p>Tagihan yang masih perlu dibayarkan penghuni.</p>
            </div>
            <strong className="arrears-count">{dashboard.tagihan.belum_lunas_detail.length}</strong>
          </div>
          <div className="dashboard-list-scroll">
            <table>
              <thead><tr><th>Rumah / Penghuni</th><th>Tagihan</th><th>Nominal</th><th>Aksi</th></tr></thead>
              <tbody>
                {dashboard.tagihan.belum_lunas_detail.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.rumah}</strong><small>{item.penghuni}</small></td>
                    <td>{item.jenis_iuran}<small>{namaBulan[item.bulan]} {item.tahun}</small></td>
                    <td>{formatRupiah(item.nominal)}</td>
                    <td>
                      <button className="pay-button" type="button" disabled={workingId === item.id} onClick={() => bayar(item)}>
                        {workingId === item.id ? "Memproses..." : "Bayar"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!dashboard.tagihan.belum_lunas_detail.length && (
                  <tr><td colSpan="4" className="table-empty">Semua tagihan sudah lunas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
        <select aria-label={`Bulan ${label.toLowerCase()} dashboard`} value={Number(bulan)} onChange={(event) => onChange(setBagianPeriode(value, "bulan", event.target.value))}>
          {namaBulan.slice(1).map((nama, index) => <option key={nama} value={index + 1}>{nama}</option>)}
        </select>
      </label>
      <label>
        Tahun
        <select aria-label={`Tahun ${label.toLowerCase()} dashboard`} value={Number(tahun)} onChange={(event) => onChange(setBagianPeriode(value, "tahun", event.target.value))}>
          {pilihanTahun.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
    </fieldset>
  );
}

function BalanceChart({ data }) {
  if (!data.length) return <div className="chart-loading">Belum ada data saldo.</div>;

  const width = 1000;
  const height = 300;
  const padding = { top: 20, right: 25, bottom: 48, left: 76 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.map((item) => Number(item.saldo_total));
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = Math.max(1, maxValue - minValue);
  const x = (index) => data.length === 1
    ? padding.left + chartWidth / 2
    : padding.left + (index / (data.length - 1)) * chartWidth;
  const y = (value) => padding.top + ((maxValue - Number(value)) / range) * chartHeight;
  const points = data.map((item, index) => ({ item, x: x(index), y: y(item.saldo_total) }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const labelStep = Math.max(1, Math.ceil(data.length / 8));
  const compact = (value) => new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);

  return (
    <div className="line-chart-wrap">
      <svg className="line-chart dashboard-balance-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafik garis total saldo dashboard">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = minValue + range * ratio;
          return (
            <g key={ratio}>
              <line className="chart-grid-line" x1={padding.left} x2={width - padding.right} y1={y(value)} y2={y(value)} />
              <text className="chart-axis-value" x={padding.left - 12} y={y(value) + 4} textAnchor="end">{compact(value)}</text>
            </g>
          );
        })}
        {minValue < 0 && maxValue > 0 && <line className="chart-zero-line" x1={padding.left} x2={width - padding.right} y1={y(0)} y2={y(0)} />}
        <path className="chart-line chart-line-balance" d={path} />
        {points.map((point) => (
          <circle key={point.item.periode} className="chart-point chart-point-balance" cx={point.x} cy={point.y} r="5">
            <title>Saldo {namaBulan[point.item.bulan]} {point.item.tahun}: {formatRupiah(point.item.saldo_total)}</title>
          </circle>
        ))}
        {data.map((item, index) => (
          (index % labelStep === 0 || index === data.length - 1) && (
            <text key={item.periode} className="chart-axis-label" x={x(index)} y={height - 17} textAnchor="middle">
              {namaBulan[item.bulan].slice(0, 3)} {String(item.tahun).slice(-2)}
            </text>
          )
        ))}
      </svg>
    </div>
  );
}

export default DashboardPage;
