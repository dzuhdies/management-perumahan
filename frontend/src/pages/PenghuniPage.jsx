import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import {
  formatTanggal,
  getApiList,
  getErrorMessage,
} from "../utils/format.js";

const emptyForm = {
  nama_lengkap: "",
  nomor_telepon: "",
  rumah_id: "",
  status_penghuni: "tetap",
  status_menikah: "0",
  tanggal_masuk: new Date().toISOString().slice(0, 10),
  foto_ktp: null,
};

function PenghuniPage() {
  const [penghuni, setPenghuni] = useState([]);
  const [rumah, setRumah] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [penghuniResponse, rumahResponse] = await Promise.all([
        api.get("/penghuni"),
        api.get("/rumah"),
      ]);
      setPenghuni(getApiList(penghuniResponse));
      setRumah(getApiList(rumahResponse));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return penghuni.filter((item) =>
      [item.nama_lengkap, item.nomor_telepon, item.rumah]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [penghuni, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      nama_lengkap: item.nama_lengkap,
      nomor_telepon: item.nomor_telepon,
      status_penghuni: item.status_penghuni,
      status_menikah: item.status_menikah ? "1" : "0",
    });
    setShowForm(true);
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = new FormData();
    payload.append("nama_lengkap", form.nama_lengkap);
    payload.append("nomor_telepon", form.nomor_telepon);
    payload.append("status_penghuni", form.status_penghuni);
    payload.append("status_menikah", form.status_menikah);
    if (form.foto_ktp) payload.append("foto_ktp", form.foto_ktp);

    if (!editingId) {
      payload.append("rumah_id", form.rumah_id);
      payload.append("tanggal_masuk", form.tanggal_masuk);
    } else {
      payload.append("_method", "PUT");
    }

    try {
      if (editingId) {
        await api.post(`/penghuni/${editingId}`, payload);
      } else {
        await api.post("/penghuni", payload);
      }
      setNotice(editingId ? "Data penghuni diperbarui." : "Penghuni berhasil ditambahkan.");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Keluarkan ${item.nama_lengkap} dari rumah ${item.rumah}? Riwayatnya tetap disimpan.`)) return;

    try {
      setError("");
      await api.delete(`/penghuni/${item.id}`);
      setNotice("Penghuni berhasil dikeluarkan. Riwayat rumah tetap tersimpan.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const rumahKosong = rumah.filter((item) => item.status === "kosong");

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Data warga</p>
          <h2>Penghuni</h2>
          <p>Kelola data penghuni dan penempatan rumah.</p>
        </div>
        <button className="button button-primary" type="button" onClick={openCreate}>
          + Tambah Penghuni
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      {showForm && (
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h3>{editingId ? "Edit penghuni" : "Penghuni baru"}</h3>
              <p>Lengkapi informasi warga di bawah ini.</p>
            </div>
            <button className="button button-ghost" type="button" onClick={() => setShowForm(false)}>
              Batal
            </button>
          </div>

          <div className="form-grid">
            <label>
              Nama lengkap
              <input required value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} />
            </label>
            <label>
              Nomor telepon
              <input required value={form.nomor_telepon} onChange={(e) => setForm({ ...form, nomor_telepon: e.target.value })} />
            </label>
            {!editingId && (
              <>
                <label>
                  Rumah
                  <select required value={form.rumah_id} onChange={(e) => setForm({ ...form, rumah_id: e.target.value })}>
                    <option value="">Pilih rumah kosong</option>
                    {rumahKosong.map((item) => <option key={item.id} value={item.id}>{item.kode_rumah}</option>)}
                  </select>
                </label>
                <label>
                  Tanggal masuk
                  <input required type="date" value={form.tanggal_masuk} onChange={(e) => setForm({ ...form, tanggal_masuk: e.target.value })} />
                </label>
              </>
            )}
            <label>
              Status penghuni
              <select value={form.status_penghuni} onChange={(e) => setForm({ ...form, status_penghuni: e.target.value })}>
                <option value="tetap">Tetap</option>
                <option value="kontrak">Kontrak</option>
              </select>
            </label>
            <label>
              Status menikah
              <select value={form.status_menikah} onChange={(e) => setForm({ ...form, status_menikah: e.target.value })}>
                <option value="0">Belum menikah</option>
                <option value="1">Menikah</option>
              </select>
            </label>
            <label className="form-wide">
              Foto KTP (opsional, maksimal 2 MB)
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, foto_ktp: e.target.files[0] ?? null })} />
            </label>
          </div>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Penghuni"}
          </button>
        </form>
      )}

      <div className="toolbar">
        <input type="search" placeholder="Cari nama, telepon, atau rumah..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span>{filtered.length} penghuni</span>
      </div>

      {loading ? <div className="page-loading">Memuat data penghuni...</div> : (
        <div className="table-card">
          <table>
            <thead><tr><th>Nama</th><th>Rumah</th><th>Status</th><th>Tanggal masuk</th><th>Kontak</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.nama_lengkap}</strong><small>{item.status_menikah ? "Menikah" : "Belum menikah"}</small></td>
                  <td>{item.rumah || "-"}</td>
                  <td><span className="badge">{item.status_penghuni}</span></td>
                  <td>{formatTanggal(item.tanggal_masuk)}</td>
                  <td>{item.nomor_telepon}</td>
                  <td className="actions">
                    <button type="button" onClick={() => openEdit(item)}>Edit</button>
                    {item.rumah && <button className="danger-link" type="button" onClick={() => remove(item)}>Keluarkan</button>}
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="6" className="table-empty">Belum ada data penghuni.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default PenghuniPage;
