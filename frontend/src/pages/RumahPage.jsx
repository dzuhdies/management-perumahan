import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Home,
    MapPin,
    Pencil,
    Phone,
    Plus,
    RefreshCw,
    Trash2,
    User,
    X,
} from "lucide-react";
import api from "../services/api.js";
import {
    formatRupiah,
    formatTanggal,
    getApiList,
    getErrorMessage,
    namaBulan,
} from "../utils/format.js";

const today = () => new Date().toISOString().slice(0, 10);

const createEmptyForm = () => ({
    nama_lengkap: "",
    nomor_telepon: "",
    status_penghuni: "tetap",
    status_menikah: "0",
    tanggal_masuk: today(),
    foto_ktp: null,
});

function RumahPage() {
    const [rumah, setRumah] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [allPayments, setAllPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [houseForm, setHouseForm] = useState({
    kode_rumah: "",
    baris_denah: "1",
    kolom_denah: "",
    urutan_tampil: "",
  });

    async function fetchRumah(preferredId = selectedId) {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/rumah");
            const list = getApiList(response);
            setRumah(list);

            const stillExists = list.some((item) => item.id === preferredId);
            setSelectedId(stillExists ? preferredId : (list[0]?.id ?? null));
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    async function fetchDetail(id) {
        if (!id) return;

        try {
            setDetailLoading(true);
            setError("");
            const response = await api.get(`/rumah/${id}`);
            setDetail(response.data?.data ?? null);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDetailLoading(false);
        }
    }

    useEffect(() => {
        fetchRumah(null);
    }, []);

    useEffect(() => {
        fetchDetail(selectedId);
    }, [selectedId]);

    const statistik = useMemo(() => ({
        total: rumah.length,
        lunas: rumah.filter((item) => item.warna === "green").length,
        belumLunas: rumah.filter((item) => item.warna === "red").length,
        kosong: rumah.filter((item) => item.warna === "gray").length,
    }), [rumah]);

    const barisA = useMemo(
        () => rumah.filter((item) => Number(item.baris_denah) === 1)
            .sort((a, b) => a.kolom_denah - b.kolom_denah),
        [rumah],
    );
    const barisB = useMemo(
        () => rumah.filter((item) => Number(item.baris_denah) === 2)
            .sort((a, b) => a.kolom_denah - b.kolom_denah),
        [rumah],
    );

  function openCreateResident() {
        setForm(createEmptyForm());
        setModal("form-create");
        setError("");
  }

  function openCreateHouse() {
    const baris = 1;
    const nextColumn = Math.max(
      0,
      ...rumah
        .filter((item) => Number(item.baris_denah) === baris)
        .map((item) => Number(item.kolom_denah)),
    ) + 1;
    const nextOrder = Math.max(0, ...rumah.map((item) => Number(item.urutan_tampil ?? item.id))) + 1;

    setHouseForm({
      kode_rumah: `A${nextColumn}`,
      baris_denah: String(baris),
      kolom_denah: String(nextColumn),
      urutan_tampil: String(nextOrder),
    });
    setModal("house-create");
    setError("");
  }

  function openEditHouse() {
    if (!detail) return;

    const selected = rumah.find((item) => item.id === detail.id);
    setHouseForm({
      kode_rumah: detail.kode_rumah,
      baris_denah: String(detail.baris_denah),
      kolom_denah: String(detail.kolom_denah),
      urutan_tampil: String(selected?.urutan_tampil ?? detail.id),
    });
    setModal("house-edit");
    setError("");
  }

    function openResidentDetail() {
        setModal("resident-detail");
    }

    function openEditResident() {
        const penghuni = detail?.penghuni;
        if (!penghuni) return;

        setForm({
            ...createEmptyForm(),
            nama_lengkap: penghuni.nama_lengkap,
            nomor_telepon: penghuni.nomor_telepon,
            status_penghuni: penghuni.status_penghuni,
            status_menikah: penghuni.status_menikah ? "1" : "0",
        });
        setModal("form-edit");
    }

    async function saveResident(event) {
        event.preventDefault();
        setWorking(true);
        setError("");

        const editing = modal === "form-edit";
        const payload = new FormData();
        payload.append("nama_lengkap", form.nama_lengkap);
        payload.append("nomor_telepon", form.nomor_telepon);
        payload.append("status_penghuni", form.status_penghuni);
        payload.append("status_menikah", form.status_menikah);
        if (form.foto_ktp) payload.append("foto_ktp", form.foto_ktp);

        if (editing) {
            payload.append("_method", "PUT");
        } else {
            payload.append("rumah_id", selectedId);
            payload.append("tanggal_masuk", form.tanggal_masuk);
        }

        try {
            if (editing) {
                await api.post(`/penghuni/${detail.penghuni.id}`, payload);
            } else {
                await api.post("/penghuni", payload);
            }

            setNotice(editing ? "Data penghuni berhasil diperbarui." : "Penghuni berhasil ditambahkan.");
            setModal(null);
            await Promise.all([fetchRumah(selectedId), fetchDetail(selectedId)]);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setWorking(false);
        }
    }

    async function saveHouse(event) {
        event.preventDefault();
        setWorking(true);
        setError("");

        const editing = modal === "house-edit";
        const payload = {
            kode_rumah: houseForm.kode_rumah.trim().toUpperCase(),
            baris_denah: Number(houseForm.baris_denah),
            kolom_denah: Number(houseForm.kolom_denah),
            urutan_tampil: Number(houseForm.urutan_tampil),
        };

        try {
            const response = editing
                ? await api.put(`/rumah/${detail.id}`, payload)
                : await api.post("/rumah", payload);
            const savedId = response.data?.data?.id ?? detail?.id;

            setModal(null);
            setNotice(editing ? "Data rumah berhasil diperbarui." : "Rumah baru berhasil ditambahkan.");
            await fetchRumah(savedId);
            await fetchDetail(savedId);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setWorking(false);
        }
    }

    async function deleteResident() {
        const penghuni = detail?.penghuni;
    if (!penghuni || !window.confirm(`Keluarkan ${penghuni.nama_lengkap} dari rumah ${detail.kode_rumah}? Riwayatnya tetap disimpan.`)) return;

        try {
            setWorking(true);
            setError("");
            await api.delete(`/penghuni/${penghuni.id}`);
            setModal(null);
            setNotice("Penghuni dikeluarkan dan rumah kembali berstatus kosong. Riwayat tetap tersimpan.");
            await Promise.all([fetchRumah(selectedId), fetchDetail(selectedId)]);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setWorking(false);
        }
    }

    async function payBill(tagihan) {
        if (!window.confirm(`Bayar ${tagihan.jenis_iuran} sebesar ${formatRupiah(tagihan.nominal)}?`)) return;

        try {
            setWorking(true);
            setError("");
            await api.post("/tagihan/bayar", {
                riwayat_penghuni_id: tagihan.riwayat_penghuni_id,
                jenis_iuran_id: tagihan.jenis_iuran_id,
                bulan: tagihan.bulan,
                tahun: tagihan.tahun,
                jumlah_bulan: 1,
                tanggal_bayar: today(),
            });
            setNotice("Pembayaran berhasil dicatat.");
            await Promise.all([fetchRumah(selectedId), fetchDetail(selectedId)]);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setWorking(false);
        }
    }

    async function openAllPayments() {
        if (!detail) return;

        setModal("payments");
        setAllPayments([]);
        setPaymentsLoading(true);
        setError("");

        try {
            const response = await api.get(`/rumah/${detail.id}/pembayaran`);
            setAllPayments(getApiList(response));
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setPaymentsLoading(false);
        }
    }

    return (
        <section>
            <header className="page-header">
                <div>
                    <h2>Denah Rumah</h2>
                    <p className="page-description">
                        Pilih rumah pada denah untuk melihat penghuni dan riwayat pembayarannya.
                    </p>
                </div>
        <div className="page-header-actions">
          <button className="button button-ghost" type="button" onClick={() => fetchRumah()} disabled={loading}>
            <RefreshCw size={16} /> {loading ? "Memuat..." : "Muat ulang"}
          </button>
          <button className="button button-primary" type="button" onClick={openCreateHouse}>
            <Plus size={16} /> Tambah rumah
          </button>
        </div>
            </header>

            {error && <div className="alert alert-error"><AlertCircle size={18} />{error}</div>}
            {notice && <div className="alert alert-success"><CheckCircle2 size={18} />{notice}</div>}

            <div className="siteplan-summary">
                <SummaryItem color="all" label="Total rumah" value={statistik.total} />
                <SummaryItem color="green" label="Lunas bulan ini" value={statistik.lunas} />
                <SummaryItem color="red" label="Belum lunas" value={statistik.belumLunas} />
                <SummaryItem color="gray" label="Rumah kosong" value={statistik.kosong} />
            </div>

            {loading && !rumah.length ? (
                <div className="page-loading">Menyiapkan denah perumahan...</div>
            ) : (
                <div className="siteplan-layout">
                    <div className="siteplan-card">
                        <div className="siteplan-card-heading">
                            <div>
                                <span>Denah blok A & B</span>
                                <strong>{rumah.length} unit rumah</strong>
                            </div>
                            <div className="siteplan-legend">
                                <Legend color="green" label="Lunas" />
                                <Legend color="red" label="Belum lunas" />
                                <Legend color="gray" label="Kosong" />
                            </div>
                        </div>

                        <div className="siteplan-map">
                            <div className="siteplan-lane">
                                <span className="lane-label">Blok A</span>
                                {barisA.map((item) => (
                                    <HousePlot
                                        key={item.id}
                                        rumah={item}
                                        active={item.id === selectedId}
                                        onClick={() => setSelectedId(item.id)}
                                    />
                                ))}
                            </div>

                            <div className="siteplan-road" aria-label="Jalan utama">
                                <span>JALAN UTAMA</span>
                                <i />
                            </div>

                            <div className="siteplan-lane">
                                <span className="lane-label">Blok B</span>
                                {barisB.map((item) => (
                                    <HousePlot
                                        key={item.id}
                                        rumah={item}
                                        active={item.id === selectedId}
                                        onClick={() => setSelectedId(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <HouseDetail
                        detail={detail}
                        loading={detailLoading}
                        working={working}
            onAddResident={openCreateResident}
            onResidentDetail={openResidentDetail}
            onEditHouse={openEditHouse}
            onPay={payBill}
            onAllPayments={openAllPayments}
                    />
                </div>
            )}

      {(modal === "resident-detail" || modal === "form-create" || modal === "form-edit") && (
                <ResidentModal
                    mode={modal}
                    detail={detail}
                    form={form}
                    setForm={setForm}
                    working={working}
                    onClose={() => setModal(null)}
                    onEdit={openEditResident}
                    onDelete={deleteResident}
          onSubmit={saveResident}
        />
      )}

      {(modal === "house-create" || modal === "house-edit") && (
        <HouseModal
          editing={modal === "house-edit"}
          form={houseForm}
          setForm={setHouseForm}
          working={working}
          onClose={() => setModal(null)}
          onSubmit={saveHouse}
        />
      )}

      {modal === "payments" && (
        <AllPaymentsModal
          houseCode={detail?.kode_rumah}
          items={allPayments}
          loading={paymentsLoading}
          onClose={() => setModal(null)}
        />
      )}
        </section>
    );
}

function SummaryItem({ color, label, value }) {
    return (
        <article>
            <span className={`summary-dot dot-${color}`} />
            <div><strong>{value}</strong><span>{label}</span></div>
        </article>
    );
}

function Legend({ color, label }) {
    return <span><i className={`legend-dot plot-${color}`} />{label}</span>;
}

function HousePlot({ rumah, active, onClick }) {
    return (
        <button
            className={`house-plot plot-${rumah.warna} ${active ? "house-plot-active" : ""}`}
            type="button"
            onClick={onClick}
            aria-label={`Rumah ${rumah.kode_rumah}, ${rumah.status_pembayaran.replaceAll("_", " ")}`}
        >
            <Home size={20} />
            <strong>{rumah.kode_rumah}</strong>
            <span>{rumah.penghuni?.nama || "Kosong"}</span>
        </button>
    );
}

function HouseDetail({ detail, loading, working, onAddResident, onResidentDetail, onEditHouse, onPay, onAllPayments }) {
  if (loading || !detail) {
    return <aside className="house-detail-panel house-detail-loading">Memuat detail rumah...</aside>;
  }

  const penghuni = detail.penghuni;
  const unpaid = detail.tagihan?.filter((item) => item.status !== "Lunas") ?? [];

  return (
    <aside className="house-detail-panel">
      <div className="house-detail-header">
        <div className="house-number-icon"><Home size={23} /></div>
        <div>
          <span>Rumah terpilih</span>
          <h3>{detail.kode_rumah}</h3>
        </div>
        <div className="house-detail-actions">
          <span className={`badge ${penghuni ? "badge-success" : ""}`}>
            {penghuni ? "Dihuni" : "Kosong"}
          </span>
          <button type="button" title="Edit rumah" aria-label="Edit rumah" onClick={onEditHouse}><Pencil size={15} /></button>
        </div>
      </div>

      <div className="house-position">
        <MapPin size={17} />
        <div><span>Posisi denah</span><strong>Baris {detail.baris_denah}, kolom {detail.kolom_denah}</strong></div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">
          <span>Penghuni aktif</span>
          {penghuni && <button type="button" onClick={onResidentDetail}>Selengkapnya <ChevronRight size={14} /></button>}
        </div>

        {penghuni ? (
          <div className="resident-preview">
            <div className="resident-avatar">{penghuni.nama_lengkap.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{penghuni.nama_lengkap}</strong>
              <span><Phone size={13} />{penghuni.nomor_telepon}</span>
              <span><CalendarDays size={13} />Masuk {formatTanggal(penghuni.tanggal_masuk)}</span>
            </div>
          </div>
        ) : (
          <div className="empty-house-callout">
            <div><User size={24} /></div>
            <strong>Rumah masih kosong</strong>
            <p>Tambahkan penghuni untuk mulai mengelola tagihan rumah ini.</p>
            <button className="button button-primary" type="button" onClick={onAddResident}>
              <Plus size={16} /> Tambah penghuni
            </button>
          </div>
        )}
      </div>

      <div className="detail-section payment-section">
          <div className="detail-section-title">
            <span>Riwayat pembayaran</span>
            <button type="button" onClick={onAllPayments}>Semua pembayaran <ChevronRight size={14} /></button>
          </div>

          {detail.tagihan?.length ? (
            <div className="payment-history">
              {detail.tagihan.slice(0, 6).map((item) => (
                <article key={item.id}>
                  <div className={`payment-icon ${item.status === "Lunas" ? "paid" : "unpaid"}`}>
                    {item.status === "Lunas" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                  </div>
                  <div className="payment-copy">
                    <strong>{item.jenis_iuran}</strong>
                    <span>{namaBulan[item.bulan]} {item.tahun} · {formatRupiah(item.nominal)}</span>
                  </div>
                  {item.status === "Lunas" ? (
                    <span className="payment-status paid-text">Lunas</span>
                  ) : (
                    <button className="payment-pay" type="button" disabled={working} onClick={() => onPay(item)}>Bayar</button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="no-payment">
              <CreditCard size={20} />
              <p>Belum ada tagihan untuk penghuni aktif.</p>
              <button type="button" onClick={onAllPayments}>Lihat semua pembayaran rumah</button>
            </div>
          )}

          {unpaid.length > 0 && (
            <div className="unpaid-reminder">
              <AlertCircle size={16} />
              <span>{unpaid.length} tagihan belum lunas</span>
            </div>
          )}
      </div>

      <div className="detail-section">
        <div className="detail-section-title">
          <span>Histori penghuni rumah</span>
        </div>
        <div className="occupant-history">
          {detail.histori_penghuni?.map((item) => (
            <article key={item.id}>
              <span className={item.sedang_menempati ? "history-marker active" : "history-marker"} />
              <div>
                <strong>{item.nama_lengkap}</strong>
                <span>
                  {formatTanggal(item.tanggal_masuk)} - {item.sedang_menempati ? "Sekarang" : formatTanggal(item.tanggal_keluar)}
                </span>
              </div>
              <small>{item.status_penghuni}</small>
            </article>
          ))}
          {!detail.histori_penghuni?.length && <p className="history-empty">Belum pernah dihuni.</p>}
        </div>
      </div>
    </aside>
  );
}

function AllPaymentsModal({ houseCode, items, loading, onClose }) {
  const paidItems = items.filter((item) => item.status === "Lunas");
  const totalPaid = paidItems.reduce(
    (total, item) => total + Number(item.nominal_dibayar || item.nominal),
    0,
  );

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="resident-modal all-payments-modal" role="dialog" aria-modal="true" aria-labelledby="all-payments-title">
        <div className="modal-header">
          <div>
            <span>Riwayat rumah {houseCode}</span>
            <h3 id="all-payments-title">Semua pembayaran</h3>
          </div>
          <button type="button" aria-label="Tutup semua pembayaran" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="all-payments-summary">
          <article>
            <span>Total tagihan</span>
            <strong>{items.length}</strong>
          </article>
          <article>
            <span>Sudah lunas</span>
            <strong>{paidItems.length}</strong>
          </article>
          <article>
            <span>Total dibayar</span>
            <strong>{formatRupiah(totalPaid)}</strong>
          </article>
        </div>

        {loading ? (
          <div className="payments-modal-loading">Memuat seluruh pembayaran rumah...</div>
        ) : (
          <div className="all-payments-table">
            <table>
              <thead>
                <tr>
                  <th>Periode</th>
                  <th>Penghuni</th>
                  <th>Jenis iuran</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Tanggal bayar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{namaBulan[item.bulan]} {item.tahun}</strong></td>
                    <td>{item.penghuni}</td>
                    <td>{item.jenis_iuran}</td>
                    <td>{formatRupiah(item.nominal)}</td>
                    <td>
                      <span className={`badge ${item.status === "Lunas" ? "badge-success" : "badge-warning"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatTanggal(item.tanggal_bayar)}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan="6" className="table-empty">Belum ada pembayaran yang tercatat untuk rumah ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ResidentModal({ mode, detail, form, setForm, working, onClose, onEdit, onDelete, onSubmit }) {
    const isDetail = mode === "resident-detail";
    const editing = mode === "form-edit";
    const penghuni = detail?.penghuni;

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <div className="resident-modal" role="dialog" aria-modal="true" aria-labelledby="resident-modal-title">
                <div className="modal-header">
                    <div>
                        <span>{detail?.kode_rumah}</span>
                        <h3 id="resident-modal-title">
                            {isDetail ? "Detail penghuni" : editing ? "Edit penghuni" : "Tambah penghuni"}
                        </h3>
                    </div>
                    <button type="button" aria-label="Tutup modal" onClick={onClose}><X size={20} /></button>
                </div>

                {isDetail ? (
                    <>
                        <div className="resident-profile">
                            <div className="resident-avatar large">{penghuni.nama_lengkap.charAt(0).toUpperCase()}</div>
                            <div><h4>{penghuni.nama_lengkap}</h4><span>{penghuni.status_penghuni}</span></div>
                        </div>
                        <div className="resident-facts">
                            <Fact label="Nomor telepon" value={penghuni.nomor_telepon} />
                            <Fact label="Status tinggal" value={penghuni.status_penghuni === "tetap" ? "Penghuni tetap" : "Kontrak"} />
                            <Fact label="Status pernikahan" value={penghuni.status_menikah ? "Menikah" : "Belum menikah"} />
                            <Fact label="Tanggal masuk" value={formatTanggal(penghuni.tanggal_masuk)} />
                        </div>
                        <div className="ktp-preview-card">
                            <div className="ktp-preview-heading">
                                <div><span>Dokumen penghuni</span><strong>Foto KTP</strong></div>
                                {penghuni.foto_ktp && <a href={penghuni.foto_ktp} target="_blank" rel="noreferrer">Buka ukuran penuh</a>}
                            </div>
                            {penghuni.foto_ktp ? (
                                <a className="ktp-preview-image" href={penghuni.foto_ktp} target="_blank" rel="noreferrer">
                                    <img src={penghuni.foto_ktp} alt={`Foto KTP ${penghuni.nama_lengkap}`} />
                                </a>
                            ) : (
                                <div className="ktp-preview-empty">Foto KTP belum dilengkapi.</div>
                            )}
                        </div>
                        <div className="modal-actions">
              <button className="button button-danger" type="button" disabled={working} onClick={onDelete}><Trash2 size={16} /> Keluarkan dari rumah</button>
                            <button className="button button-primary" type="button" onClick={onEdit}><Pencil size={16} /> Edit data</button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={onSubmit}>
                        <div className="form-grid">
                            <label>Nama lengkap<input required value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} /></label>
                            <label>Nomor telepon<input required value={form.nomor_telepon} onChange={(e) => setForm({ ...form, nomor_telepon: e.target.value })} /></label>
                            {!editing && <label>Tanggal masuk<input required type="date" value={form.tanggal_masuk} onChange={(e) => setForm({ ...form, tanggal_masuk: e.target.value })} /></label>}
                            <label>Status penghuni<select value={form.status_penghuni} onChange={(e) => setForm({ ...form, status_penghuni: e.target.value })}><option value="tetap">Tetap</option><option value="kontrak">Kontrak</option></select></label>
                            <label>Status menikah<select value={form.status_menikah} onChange={(e) => setForm({ ...form, status_menikah: e.target.value })}><option value="0">Belum menikah</option><option value="1">Menikah</option></select></label>
                            <label className="form-wide">Foto KTP (opsional)<input type="file" accept="image/*" onChange={(e) => setForm({ ...form, foto_ktp: e.target.files[0] ?? null })} /></label>
                        </div>
                        <div className="modal-actions">
                            <button className="button button-ghost" type="button" onClick={onClose}>Batal</button>
                            <button className="button button-primary" type="submit" disabled={working}>{working ? "Menyimpan..." : "Simpan penghuni"}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function HouseModal({ editing, form, setForm, working, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="resident-modal" role="dialog" aria-modal="true" aria-labelledby="house-modal-title">
        <div className="modal-header">
          <div>
            <span>Data rumah</span>
            <h3 id="house-modal-title">{editing ? "Edit rumah" : "Tambah rumah"}</h3>
          </div>
          <button type="button" aria-label="Tutup modal rumah" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label>Kode rumah<input required maxLength="20" value={form.kode_rumah} onChange={(e) => setForm({ ...form, kode_rumah: e.target.value })} /></label>
            <label>Sisi jalan
              <select value={form.baris_denah} onChange={(e) => setForm({ ...form, baris_denah: e.target.value })}>
                <option value="1">Blok A - kiri jalan</option>
                <option value="2">Blok B - kanan jalan</option>
              </select>
            </label>
            <label>Posisi/kolom<input required min="1" type="number" value={form.kolom_denah} onChange={(e) => setForm({ ...form, kolom_denah: e.target.value })} /></label>
            <label>Urutan tampil<input required min="1" type="number" value={form.urutan_tampil} onChange={(e) => setForm({ ...form, urutan_tampil: e.target.value })} /></label>
          </div>
          <div className="modal-note">Status rumah otomatis mengikuti ada atau tidaknya penghuni aktif.</div>
          <div className="modal-actions">
            <button className="button button-ghost" type="button" onClick={onClose}>Batal</button>
            <button className="button button-primary" type="submit" disabled={working}>{working ? "Menyimpan..." : "Simpan rumah"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
    return <div><span>{label}</span><strong>{value}</strong></div>;
}

export default RumahPage;
