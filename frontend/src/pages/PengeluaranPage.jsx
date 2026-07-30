import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { formatRupiah, formatTanggal, getApiList, getErrorMessage } from "../utils/format.js";

const emptyForm = {
  tanggal_pengeluaran: new Date().toISOString().slice(0, 10),
  judul: "",
  nominal: "",
  deskripsi: "",
};

function PengeluaranPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setItems(getApiList(await api.get("/pengeluaran")));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.nominal), 0), [items]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      tanggal_pengeluaran: String(item.tanggal_pengeluaran).slice(0, 10),
      judul: item.judul,
      nominal: item.nominal,
      deskripsi: item.deskripsi || "",
    });
    setShowForm(true);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/pengeluaran/${editingId}`, form);
      } else {
        await api.post("/pengeluaran", form);
      }
      setNotice(editingId ? "Pengeluaran diperbarui." : "Pengeluaran berhasil dicatat.");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Hapus pengeluaran "${item.judul}"?`)) return;
    try {
      await api.delete(`/pengeluaran/${item.id}`);
      setNotice("Pengeluaran berhasil dihapus.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section>
      <header className="page-header">
        <div><h2>Data Pengeluaran</h2></div>
        <button className="button button-primary" type="button" onClick={openCreate}>+ Catat Pengeluaran</button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="summary-strip">
        <span>Total seluruh pengeluaran tercatat</span>
        <strong>{formatRupiah(total)}</strong>
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading"><div><h3>{editingId ? "Edit pengeluaran" : "Pengeluaran baru"}</h3><p>Isi transaksi penggunaan kas.</p></div><button className="button button-ghost" type="button" onClick={() => setShowForm(false)}>Batal</button></div>
          <div className="form-grid">
            <label>Tanggal<input required type="date" value={form.tanggal_pengeluaran} onChange={(e) => setForm({ ...form, tanggal_pengeluaran: e.target.value })} /></label>
            <label>Judul<input required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} /></label>
            <label>Nominal<input required min="1" type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} /></label>
            <label className="form-wide">Deskripsi<textarea rows="3" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></label>
          </div>
          <button className="button button-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Pengeluaran"}</button>
        </form>
      )}

      {loading ? <div className="page-loading">Memuat pengeluaran...</div> : (
        <div className="table-card">
          <table>
            <thead><tr><th>Tanggal</th><th>Pengeluaran</th><th>Deskripsi</th><th>Nominal</th><th>Aksi</th></tr></thead>
            <tbody>
              {items.map((item) => <tr key={item.id}><td>{formatTanggal(item.tanggal_pengeluaran)}</td><td><strong>{item.judul}</strong></td><td>{item.deskripsi || "-"}</td><td><strong>{formatRupiah(item.nominal)}</strong></td><td className="actions"><button onClick={() => openEdit(item)}>Edit</button><button className="danger-link" onClick={() => remove(item)}>Hapus</button></td></tr>)}
              {!items.length && <tr><td colSpan="5" className="table-empty">Belum ada pengeluaran.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default PengeluaranPage;
