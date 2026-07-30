import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, X } from "lucide-react";
import api from "../services/api.js";
import { formatRupiah, formatTanggal, getApiList, getErrorMessage, namaBulan } from "../utils/format.js";

const sekarang = new Date();
const pilihanTahun = Array.from(
  { length: 8 },
  (_, index) => sekarang.getFullYear() + 1 - index,
);

function TagihanPage() {
  const [items, setItems] = useState([]);
  const [bulan, setBulan] = useState(sekarang.getMonth() + 1);
  const [tahun, setTahun] = useState(sekarang.getFullYear());
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [paymentItem, setPaymentItem] = useState(null);
  const [jumlahBulan, setJumlahBulan] = useState(1);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/tagihan", { params: { bulan, tahun, ...(status && { status }) } });
      setItems(getApiList(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [bulan, tahun, status]);

  useEffect(() => { loadData(); }, [loadData]);

  const summary = useMemo(() => ({
    total: items.reduce((sum, item) => sum + Number(item.nominal), 0),
    lunas: items.filter((item) => item.status === "Lunas").length,
    belum: items.filter((item) => item.status !== "Lunas").length,
  }), [items]);

  async function generate() {
    try {
      setWorking(true);
      setError("");
      await api.post("/tagihan/generate", { bulan, tahun });
      setNotice(`Tagihan ${namaBulan[bulan]} ${tahun} berhasil dibuat.`);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  }

  function openPayment(item) {
    setPaymentItem(item);
    setJumlahBulan(1);
    setError("");
  }

  function pindahBulan(jumlah) {
    const periode = new Date(tahun, bulan - 1 + jumlah, 1);
    setBulan(periode.getMonth() + 1);
    setTahun(periode.getFullYear());
  }

  function kembaliKeBulanIni() {
    setBulan(sekarang.getMonth() + 1);
    setTahun(sekarang.getFullYear());
  }

  async function bayar(event) {
    event.preventDefault();
    if (!paymentItem) return;

    try {
      setWorking(true);
      setError("");
      await api.post("/tagihan/bayar", {
        riwayat_penghuni_id: paymentItem.riwayat_penghuni_id,
        jenis_iuran_id: paymentItem.jenis_iuran_id,
        bulan: paymentItem.bulan,
        tahun: paymentItem.tahun,
        jumlah_bulan: Number(jumlahBulan),
        tanggal_bayar: new Date().toISOString().slice(0, 10),
      });
      setNotice(`Pembayaran ${jumlahBulan} bulan berhasil dicatat.`);
      setPaymentItem(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
        <h2>Data Tagihan Penghuni</h2></div>
        <button className="button button-primary" type="button" disabled={working} onClick={generate}>
          <CalendarRange size={17} /> {working ? "Memproses..." : "Generate Tagihan"}
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="tagihan-filter-panel">
        <div className="tagihan-filter-content">
          <div className="tagihan-period-filter">
            <span className="tagihan-filter-label">Periode tagihan</span>
            <div className="tagihan-period-controls">
              <button className="period-arrow" type="button" aria-label="Bulan sebelumnya" onClick={() => pindahBulan(-1)}>
                <ChevronLeft size={18} />
              </button>
              <label>
                <span>Bulan</span>
                <select value={bulan} onChange={(event) => setBulan(Number(event.target.value))}>
                  {namaBulan.slice(1).map((nama, index) => <option key={nama} value={index + 1}>{nama}</option>)}
                </select>
              </label>
              <label>
                <span>Tahun</span>
                <select value={tahun} onChange={(event) => setTahun(Number(event.target.value))}>
                  {pilihanTahun.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <button className="period-arrow" type="button" aria-label="Bulan berikutnya" onClick={() => pindahBulan(1)}>
                <ChevronRight size={18} />
              </button>
              <button className="current-month-button" type="button" onClick={kembaliKeBulanIni}>
                <CalendarDays size={16} /> Bulan ini
              </button>
            </div>
          </div>

          <div className="tagihan-status-filter">
            <span className="tagihan-filter-label">Status pembayaran</span>
            <div className="tagihan-status-buttons">
              {[
                ["", "Semua"],
                ["lunas", "Lunas"],
                ["belum_lunas", "Belum lunas"],
              ].map(([value, label]) => (
                <button
                  key={value || "semua"}
                  className={status === value ? `active status-${value || "semua"}` : ""}
                  type="button"
                  aria-pressed={status === value}
                  onClick={() => setStatus(value)}
                >
                  <i />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tagihan-active-filter">
          <span>Menampilkan</span>
          <strong>{namaBulan[bulan]} {tahun}</strong>
          <small>{status === "lunas" ? "Hanya tagihan lunas" : status === "belum_lunas" ? "Hanya yang belum lunas" : "Semua status pembayaran"}</small>
        </div>
      </div>

      <div className="mini-stat-grid">
        <article><span>Total nominal</span><strong>{formatRupiah(summary.total)}</strong></article>
        <article><span>Tagihan lunas</span><strong>{summary.lunas}</strong></article>
        <article><span>Belum lunas</span><strong>{summary.belum}</strong></article>
      </div>

      {loading ? <div className="page-loading">Memuat tagihan...</div> : (
        <div className="table-card">
          <table>
            <thead><tr><th>Rumah / Penghuni</th><th>Jenis iuran</th><th>Nominal</th><th>Status</th><th>Tanggal bayar</th><th>Aksi</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.rumah}</strong><small>{item.penghuni}</small></td>
                  <td>{item.jenis_iuran}</td>
                  <td>{formatRupiah(item.nominal)}</td>
                  <td><span className={`badge ${item.status === "Lunas" ? "badge-success" : "badge-warning"}`}>{item.status}</span></td>
                  <td>{formatTanggal(item.tanggal_bayar)}</td>
                  <td>{item.status !== "Lunas" ? <button className="pay-button" disabled={working} onClick={() => openPayment(item)}>Bayar</button> : "—"}</td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan="6" className="table-empty">Belum ada tagihan pada periode ini. Klik Generate Tagihan.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {paymentItem && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPaymentItem(null)}>
          <div className="resident-modal payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
            <div className="modal-header">
              <div>
                <span>Catat pembayaran</span>
                <h3 id="payment-modal-title">{paymentItem.penghuni}</h3>
              </div>
              <button type="button" aria-label="Tutup pembayaran" onClick={() => setPaymentItem(null)}><X size={20} /></button>
            </div>
            <form onSubmit={bayar}>
              <div className="payment-modal-summary">
                <CalendarRange size={22} />
                <div>
                  <strong>{paymentItem.jenis_iuran} · {paymentItem.rumah}</strong>
                  <span>Mulai {namaBulan[paymentItem.bulan]} {paymentItem.tahun}</span>
                </div>
              </div>
              <label className="payment-month-field">
                Dibayar untuk
                <select value={jumlahBulan} onChange={(e) => setJumlahBulan(Number(e.target.value))}>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>{value} bulan{value === 12 ? " (1 tahun)" : ""}</option>
                  ))}
                </select>
              </label>
              <div className="payment-total">
                <span>Total pembayaran</span>
                <strong>{formatRupiah(Number(paymentItem.nominal) * jumlahBulan)}</strong>
              </div>
              <p className="modal-helper">
                Tagihan periode berikutnya akan otomatis dibuat dan ditandai lunas apabila belum tersedia.
              </p>
              <div className="modal-actions">
                <button className="button button-ghost" type="button" onClick={() => setPaymentItem(null)}>Batal</button>
                <button className="button button-primary" type="submit" disabled={working}>{working ? "Menyimpan..." : "Simpan pembayaran"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default TagihanPage;
