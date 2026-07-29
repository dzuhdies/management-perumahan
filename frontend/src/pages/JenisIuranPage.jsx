import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { formatRupiah, getApiList, getErrorMessage } from "../utils/format.js";

const emptyForm = {
  nama_iuran: "",
  nominal: "",
};

function JenisIuranPage() {
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
      setError("");
      setItems(getApiList(await api.get("/jenis-iuran")));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalNominal = useMemo(
    () => items.reduce((total, item) => total + Number(item.nominal), 0),
    [items],
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      nama_iuran: item.nama_iuran,
      nominal: item.nominal,
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        nama_iuran: form.nama_iuran.trim(),
        nominal: Number(form.nominal),
      };

      if (editingId) {
        await api.put(`/jenis-iuran/${editingId}`, payload);
      } else {
        await api.post("/jenis-iuran", payload);
      }

      setNotice(editingId
        ? "Jenis iuran berhasil diperbarui."
        : "Jenis iuran berhasil ditambahkan.");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Pengaturan tagihan</p>
          <h2>Jenis Iuran</h2>
          <p>Atur nama dan nominal iuran yang ditagihkan kepada penghuni.</p>
        </div>
        <button className="button button-primary" type="button" onClick={openCreate}>
          + Tambah Jenis Iuran
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="iuran-summary-grid">
        <article>
          <span>Jenis iuran aktif</span>
          <strong>{items.length}</strong>
        </article>
        <article>
          <span>Total tagihan per rumah / bulan</span>
          <strong>{formatRupiah(totalNominal)}</strong>
        </article>
      </div>

      <div className="alert alert-info">
        Perubahan nominal berlaku untuk tagihan yang dibuat setelah perubahan. Tagihan lama tetap memakai nominal sebelumnya.
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h3>{editingId ? "Edit jenis iuran" : "Jenis iuran baru"}</h3>
              <p>Nama iuran harus unik dan nominal minimal Rp1.</p>
            </div>
            <button className="button button-ghost" type="button" onClick={() => setShowForm(false)}>
              Batal
            </button>
          </div>
          <div className="form-grid">
            <label>
              Nama iuran
              <input
                autoFocus
                required
                maxLength="255"
                placeholder="Contoh: Dana sosial"
                value={form.nama_iuran}
                onChange={(event) => setForm({ ...form, nama_iuran: event.target.value })}
              />
            </label>
            <label>
              Nominal per bulan
              <input
                required
                min="1"
                step="1"
                type="number"
                placeholder="Contoh: 25000"
                value={form.nominal}
                onChange={(event) => setForm({ ...form, nominal: event.target.value })}
              />
            </label>
          </div>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Jenis Iuran"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="page-loading">Memuat jenis iuran...</div>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Nama iuran</th>
                <th>Nominal per bulan</th>
                <th>Tagihan tercatat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.nama_iuran}</strong></td>
                  <td><strong>{formatRupiah(item.nominal)}</strong></td>
                  <td>{item.jumlah_tagihan}</td>
                  <td className="actions">
                    <button type="button" onClick={() => openEdit(item)}>Edit</button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan="4" className="table-empty">Belum ada jenis iuran.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default JenisIuranPage;
