<?php

namespace App\Services;

use App\Models\Pengeluaran;
use App\Models\Penghuni;
use App\Models\Rumah;
use App\Models\Tagihan;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

class DashboardService
{
    public function index(Request $request): array
    {
        $bulan = now()->month;
        $tahun = now()->year;

        $rumah = Rumah::query()
            ->with('penghuniAktif.penghuni')
            ->orderBy('urutan_tampil')
            ->get();

        $totalPenghuni = Penghuni::query()
            ->whereHas(
                'riwayatPenghuni',
                fn ($query) => $query->where('sedang_menempati', true)
            )
            ->count();

        $tagihanLunas = Tagihan::whereNotNull('tanggal_bayar')
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->count();

        $tagihanBelumLunas = Tagihan::whereNull('tanggal_bayar')
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->count();

        $pemasukan = Tagihan::whereNotNull('tanggal_bayar')
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->sum('nominal_dibayar');

        $pengeluaran = Pengeluaran::whereMonth(
            'tanggal_pengeluaran',
            $bulan
        )
            ->whereYear(
                'tanggal_pengeluaran',
                $tahun
            )
            ->sum('nominal');

        $tagihanSudahDibuat = Tagihan::where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->exists();

        $totalPemasukan = Tagihan::query()
            ->whereNotNull('tanggal_bayar')
            ->sum('nominal_dibayar');

        $totalPengeluaran = Pengeluaran::sum('nominal');

        $tagihanBelumLunasDetail = Tagihan::query()
            ->with([
                'riwayatPenghuni.rumah',
                'riwayatPenghuni.penghuni',
                'jenisIuran',
            ])
            ->whereNull('tanggal_bayar')
            ->orderBy('tahun')
            ->orderBy('bulan')
            ->get()
            ->map(fn (Tagihan $tagihan) => [
                'id' => $tagihan->id,
                'riwayat_penghuni_id' => $tagihan->riwayat_penghuni_id,
                'jenis_iuran_id' => $tagihan->jenis_iuran_id,
                'rumah' => $tagihan->riwayatPenghuni->rumah->kode_rumah,
                'penghuni' => $tagihan->riwayatPenghuni->penghuni->nama_lengkap,
                'jenis_iuran' => $tagihan->jenisIuran->nama_iuran,
                'bulan' => $tagihan->bulan,
                'tahun' => $tagihan->tahun,
                'nominal' => (float) $tagihan->nominal,
            ])
            ->values();

        return [
            'periode' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],

            'rumah' => [
                'total' => $rumah->count(),
                'dihuni' => $rumah->where('status', 'dihuni')->count(),
                'kosong' => $rumah->where('status', 'kosong')->count(),
            ],

            'rumah_penghuni' => $rumah->map(fn (Rumah $unit) => [
                'id' => $unit->id,
                'kode_rumah' => $unit->kode_rumah,
                'status' => $unit->status,
                'penghuni' => $unit->penghuniAktif?->penghuni?->nama_lengkap,
            ])->values(),

            'penghuni' => [
                'total' => $totalPenghuni,
            ],

            'tagihan' => [
                'lunas' => $tagihanLunas,
                'belum_lunas' => $tagihanBelumLunas,
                'sudah_generate' => $tagihanSudahDibuat,
                'belum_lunas_detail' => $tagihanBelumLunasDetail,
            ],

            'keuangan' => [
                'pemasukan_bulan_ini' => (float) $pemasukan,
                'pengeluaran_bulan_ini' => (float) $pengeluaran,
                'saldo_bulan_ini' => (float) ($pemasukan - $pengeluaran),
                'total_pemasukan' => (float) $totalPemasukan,
                'total_pengeluaran' => (float) $totalPengeluaran,
                'saldo_total' => (float) ($totalPemasukan - $totalPengeluaran),
            ],

            'grafik_saldo' => $this->grafikSaldo($request),
        ];
    }

    private function grafikSaldo(Request $request): array
    {
        [$mulai, $selesai] = $this->rentangGrafik($request);
        $grafik = [];

        for ($periode = $mulai; $periode->lessThanOrEqualTo($selesai); $periode = $periode->addMonth()) {
            $pemasukan = Tagihan::query()
                ->whereNotNull('tanggal_bayar')
                ->whereDate('tanggal_bayar', '<=', $periode->endOfMonth()->toDateString())
                ->sum('nominal_dibayar');

            $pengeluaran = Pengeluaran::query()
                ->whereDate('tanggal_pengeluaran', '<=', $periode->endOfMonth()->toDateString())
                ->sum('nominal');

            $grafik[] = [
                'periode' => $periode->format('Y-m'),
                'bulan' => $periode->month,
                'tahun' => $periode->year,
                'saldo_total' => (float) ($pemasukan - $pengeluaran),
            ];
        }

        return $grafik;
    }

    private function rentangGrafik(Request $request): array
    {
        $akhir = CarbonImmutable::now()->startOfMonth();

        return match ($request->input('rentang', '3_bulan')) {
            '1_bulan' => [$akhir, $akhir],
            '6_bulan' => [$akhir->subMonths(5), $akhir],
            '1_tahun' => [$akhir->subMonths(11), $akhir],
            'custom' => [
                CarbonImmutable::createFromFormat('Y-m', (string) $request->input('dari'))->startOfMonth(),
                CarbonImmutable::createFromFormat('Y-m', (string) $request->input('sampai'))->startOfMonth(),
            ],
            default => [$akhir->subMonths(2), $akhir],
        };
    }
}
