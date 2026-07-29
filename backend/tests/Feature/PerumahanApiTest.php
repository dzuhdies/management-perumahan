<?php

namespace Tests\Feature;

use App\Models\JenisIuran;
use App\Models\Pengeluaran;
use App\Models\Penghuni;
use App\Models\RiwayatPenghuni;
use App\Models\Rumah;
use App\Models\Tagihan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class PerumahanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_chart_supports_three_month_and_custom_ranges(): void
    {
        Carbon::setTestNow('2026-07-29');

        $rumah = Rumah::create([
            'kode_rumah' => 'L-01',
            'status' => 'dihuni',
            'baris_denah' => 1,
            'kolom_denah' => 1,
            'urutan_tampil' => 1,
        ]);
        $penghuni = Penghuni::create([
            'nama_lengkap' => 'Penghuni Laporan',
            'nomor_telepon' => '08127770001',
            'status_penghuni' => 'tetap',
            'status_menikah' => true,
        ]);
        $riwayat = RiwayatPenghuni::create([
            'rumah_id' => $rumah->id,
            'penghuni_id' => $penghuni->id,
            'tanggal_masuk' => '2025-01-01',
            'sedang_menempati' => true,
        ]);
        $iuran = JenisIuran::create([
            'nama_iuran' => 'Iuran laporan',
            'nominal' => 50000,
        ]);
        $iuranBelumLunas = JenisIuran::create([
            'nama_iuran' => 'Iuran belum lunas',
            'nominal' => 25000,
        ]);

        foreach ([[12, 2025], [5, 2026], [6, 2026], [7, 2026]] as [$bulan, $tahun]) {
            Tagihan::create([
                'riwayat_penghuni_id' => $riwayat->id,
                'jenis_iuran_id' => $iuran->id,
                'bulan' => $bulan,
                'tahun' => $tahun,
                'nominal' => 50000,
                'nominal_dibayar' => 50000,
                'tanggal_bayar' => sprintf('%d-%02d-05', $tahun, $bulan),
            ]);
        }

        foreach ([5, 6, 7] as $bulan) {
            Pengeluaran::create([
                'tanggal_pengeluaran' => sprintf('2026-%02d-10', $bulan),
                'judul' => 'Operasional',
                'nominal' => 70000,
            ]);
        }

        Tagihan::create([
            'riwayat_penghuni_id' => $riwayat->id,
            'jenis_iuran_id' => $iuranBelumLunas->id,
            'bulan' => 7,
            'tahun' => 2026,
            'nominal' => 25000,
            'nominal_dibayar' => 0,
        ]);

        $this->getJson('/api/laporan/grafik?rentang=3_bulan')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.periode', '2026-05')
            ->assertJsonPath('data.2.periode', '2026-07')
            ->assertJsonPath('data.2.pemasukan', 50000)
            ->assertJsonPath('data.2.pengeluaran', 70000)
            ->assertJsonPath('data.2.saldo', -20000);

        $this->getJson('/api/laporan/summary?rentang=3_bulan')
            ->assertOk()
            ->assertJsonPath('data.dari', '2026-05')
            ->assertJsonPath('data.sampai', '2026-07')
            ->assertJsonPath('data.pemasukan', 150000)
            ->assertJsonPath('data.pengeluaran', 210000)
            ->assertJsonPath('data.saldo', -60000);

        $this->getJson('/api/laporan/detail?rentang=3_bulan')
            ->assertOk()
            ->assertJsonCount(3, 'data.pemasukan')
            ->assertJsonCount(3, 'data.pengeluaran');

        $this->getJson('/api/dashboard?rentang=3_bulan')
            ->assertOk()
            ->assertJsonCount(3, 'data.grafik_saldo')
            ->assertJsonPath('data.rumah_penghuni.0.kode_rumah', 'L-01')
            ->assertJsonPath('data.rumah_penghuni.0.penghuni', 'Penghuni Laporan')
            ->assertJsonPath('data.keuangan.pemasukan_bulan_ini', 50000)
            ->assertJsonPath('data.keuangan.pengeluaran_bulan_ini', 70000)
            ->assertJsonPath('data.keuangan.saldo_total', -10000)
            ->assertJsonPath('data.grafik_saldo.2.saldo_total', -10000)
            ->assertJsonPath('data.tagihan.belum_lunas_detail.0.penghuni', 'Penghuni Laporan');

        $this->getJson('/api/laporan/grafik?rentang=custom&dari=2025-12&sampai=2026-01')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.periode', '2025-12')
            ->assertJsonPath('data.1.periode', '2026-01');

        $this->getJson('/api/laporan/grafik?rentang=custom&dari=2026-07&sampai=2026-01')
            ->assertUnprocessable();

        Carbon::setTestNow();
    }

    public function test_all_house_payments_include_current_and_former_occupants(): void
    {
        $rumah = Rumah::create([
            'kode_rumah' => 'A-10',
            'status' => 'dihuni',
            'baris_denah' => 1,
            'kolom_denah' => 10,
            'urutan_tampil' => 10,
        ]);
        $iuran = JenisIuran::create([
            'nama_iuran' => 'Satpam',
            'nominal' => 100000,
        ]);

        foreach ([
            ['nama' => 'Penghuni Lama', 'telepon' => '08120000091', 'masuk' => '2025-01-01', 'keluar' => '2025-06-30', 'aktif' => false, 'bulan' => 6, 'tahun' => 2025],
            ['nama' => 'Penghuni Baru', 'telepon' => '08120000092', 'masuk' => '2026-01-01', 'keluar' => null, 'aktif' => true, 'bulan' => 7, 'tahun' => 2026],
        ] as $data) {
            $penghuni = Penghuni::create([
                'nama_lengkap' => $data['nama'],
                'nomor_telepon' => $data['telepon'],
                'status_penghuni' => 'kontrak',
                'status_menikah' => false,
            ]);
            $riwayat = RiwayatPenghuni::create([
                'rumah_id' => $rumah->id,
                'penghuni_id' => $penghuni->id,
                'tanggal_masuk' => $data['masuk'],
                'tanggal_keluar' => $data['keluar'],
                'sedang_menempati' => $data['aktif'],
            ]);

            Tagihan::create([
                'riwayat_penghuni_id' => $riwayat->id,
                'jenis_iuran_id' => $iuran->id,
                'bulan' => $data['bulan'],
                'tahun' => $data['tahun'],
                'nominal' => 100000,
                'nominal_dibayar' => 100000,
                'tanggal_bayar' => "{$data['tahun']}-{$data['bulan']}-05",
            ]);
        }

        $this->getJson("/api/rumah/{$rumah->id}/pembayaran")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.penghuni', 'Penghuni Baru')
            ->assertJsonPath('data.1.penghuni', 'Penghuni Lama');
    }

    public function test_demo_seeder_adds_six_month_history_to_five_empty_houses(): void
    {
        Carbon::setTestNow('2026-07-29');

        $this->seed();

        $rumahKosong = Rumah::query()
            ->orderBy('urutan_tampil')
            ->skip(15)
            ->take(5)
            ->get();

        $this->assertCount(5, $rumahKosong);

        foreach ($rumahKosong as $unit) {
            $riwayat = $unit->riwayatPenghuni()
                ->orderBy('tanggal_masuk')
                ->get();

            $this->assertCount(5, $riwayat);
            $this->assertTrue($riwayat->every(
                fn (RiwayatPenghuni $item) => ! $item->sedang_menempati
                    && $item->tanggal_keluar->isSameDay(
                        $item->tanggal_masuk->copy()->addMonths(6)->subDay()
                    )
            ));
            $this->assertSame('kosong', $unit->fresh()->status);
        }

        Carbon::setTestNow();
    }

    public function test_jenis_iuran_can_be_listed_created_and_updated(): void
    {
        $response = $this->postJson('/api/jenis-iuran', [
            'nama_iuran' => 'Dana sosial',
            'nominal' => 25000,
        ])
            ->assertCreated()
            ->assertJsonPath('data.nama_iuran', 'Dana sosial')
            ->assertJsonPath('data.nominal', 25000);

        $jenisIuranId = $response->json('data.id');

        $this->putJson("/api/jenis-iuran/{$jenisIuranId}", [
            'nama_iuran' => 'Dana sosial warga',
            'nominal' => 30000,
        ])
            ->assertOk()
            ->assertJsonPath('data.nama_iuran', 'Dana sosial warga')
            ->assertJsonPath('data.nominal', 30000);

        $this->getJson('/api/jenis-iuran')
            ->assertOk()
            ->assertJsonPath('data.0.jumlah_tagihan', 0);

        $this->postJson('/api/jenis-iuran', [
            'nama_iuran' => 'Dana sosial warga',
            'nominal' => 30000,
        ])->assertUnprocessable();
    }

    public function test_rumah_can_be_created_and_updated(): void
    {
        $response = $this->postJson('/api/rumah', [
            'kode_rumah' => 'C-01',
            'baris_denah' => 3,
            'kolom_denah' => 1,
            'urutan_tampil' => 21,
        ])
            ->assertCreated()
            ->assertJsonPath('data.kode_rumah', 'C-01')
            ->assertJsonPath('data.status', 'kosong');

        $rumahId = $response->json('data.id');

        $this->putJson("/api/rumah/{$rumahId}", [
            'kode_rumah' => 'C-1',
            'baris_denah' => 3,
            'kolom_denah' => 1,
            'urutan_tampil' => 21,
        ])
            ->assertOk()
            ->assertJsonPath('data.kode_rumah', 'C-1');
    }

    public function test_rumah_response_matches_react_contract(): void
    {
        $rumah = Rumah::create([
            'kode_rumah' => 'A-01',
            'status' => 'dihuni',
            'baris_denah' => 1,
            'kolom_denah' => 1,
            'urutan_tampil' => 1,
        ]);
        $penghuni = Penghuni::create([
            'nama_lengkap' => 'Budi',
            'nomor_telepon' => '08123456789',
            'status_penghuni' => 'tetap',
            'status_menikah' => true,
        ]);
        RiwayatPenghuni::create([
            'rumah_id' => $rumah->id,
            'penghuni_id' => $penghuni->id,
            'tanggal_masuk' => '2026-07-01',
            'sedang_menempati' => true,
        ]);

        $this->getJson('/api/rumah')
            ->assertOk()
            ->assertJsonPath('data.0.kode_rumah', 'A-01')
            ->assertJsonPath('data.0.warna', 'red')
            ->assertJsonPath('data.0.status_pembayaran', 'belum_lunas')
            ->assertJsonPath('data.0.penghuni.nama', 'Budi')
            ->assertJsonPath('data.0.penghuni.nomor_telepon', '08123456789');

        $this->getJson("/api/rumah/{$rumah->id}")
            ->assertOk()
            ->assertJsonPath('data.baris_denah', 1)
            ->assertJsonPath('data.penghuni.nama_lengkap', 'Budi');
    }

    public function test_penghuni_can_be_created_without_ktp_photo(): void
    {
        $rumah = Rumah::create([
            'kode_rumah' => 'A-02',
            'status' => 'kosong',
            'baris_denah' => 1,
            'kolom_denah' => 2,
            'urutan_tampil' => 2,
        ]);

        $this->postJson('/api/penghuni', [
            'rumah_id' => $rumah->id,
            'nama_lengkap' => 'Siti',
            'nomor_telepon' => '08120000000',
            'status_penghuni' => 'kontrak',
            'status_menikah' => false,
            'tanggal_masuk' => '2026-02-28',
        ])
            ->assertCreated()
            ->assertJsonPath('data.rumah', 'A-02');

        $this->assertDatabaseHas('rumah', [
            'id' => $rumah->id,
            'status' => 'dihuni',
        ]);

        $penghuniId = $this->getJson('/api/penghuni')
            ->assertOk()
            ->json('data.0.id');

        $this->deleteJson("/api/penghuni/{$penghuniId}")
            ->assertOk();

        $this->assertDatabaseHas('penghuni', ['id' => $penghuniId]);
        $this->getJson("/api/rumah/{$rumah->id}")
            ->assertOk()
            ->assertJsonPath('data.histori_penghuni.0.nama_lengkap', 'Siti')
            ->assertJsonPath('data.histori_penghuni.0.sedang_menempati', false);
    }

    public function test_tagihan_can_be_generated_for_february_and_paid(): void
    {
        $rumah = Rumah::create([
            'kode_rumah' => 'B-01',
            'status' => 'dihuni',
            'baris_denah' => 2,
            'kolom_denah' => 1,
            'urutan_tampil' => 3,
        ]);
        $penghuni = Penghuni::create([
            'nama_lengkap' => 'Ani',
            'nomor_telepon' => '08121111111',
            'status_penghuni' => 'tetap',
            'status_menikah' => false,
        ]);
        $riwayat = RiwayatPenghuni::create([
            'rumah_id' => $rumah->id,
            'penghuni_id' => $penghuni->id,
            'tanggal_masuk' => '2026-02-28',
            'sedang_menempati' => true,
        ]);
        $iuran = JenisIuran::create([
            'nama_iuran' => 'Kebersihan',
            'nominal' => 50000,
        ]);

        $this->postJson('/api/tagihan/generate', [
            'bulan' => 2,
            'tahun' => 2026,
        ])->assertOk();

        $this->getJson('/api/tagihan?bulan=2&tahun=2026')
            ->assertOk()
            ->assertJsonPath('data.0.riwayat_penghuni_id', $riwayat->id)
            ->assertJsonPath('data.0.jenis_iuran_id', $iuran->id);

        $this->travelTo('2026-02-28');
        $this->getJson('/api/rumah')
            ->assertOk()
            ->assertJsonPath('data.0.warna', 'red');

        $this->postJson('/api/tagihan/bayar', [
            'riwayat_penghuni_id' => $riwayat->id,
            'jenis_iuran_id' => $iuran->id,
            'bulan' => 2,
            'tahun' => 2026,
            'jumlah_bulan' => 12,
            'tanggal_bayar' => '2026-02-28',
        ])
            ->assertOk()
            ->assertJsonPath('data.jumlah_tagihan', 12);

        $this->getJson('/api/rumah')
            ->assertOk()
            ->assertJsonPath('data.0.warna', 'green');

        $this->assertDatabaseHas('tagihan', [
            'riwayat_penghuni_id' => $riwayat->id,
            'jenis_iuran_id' => $iuran->id,
            'nominal_dibayar' => 50000,
        ]);
        $this->assertDatabaseCount('tagihan', 12);
    }
}
