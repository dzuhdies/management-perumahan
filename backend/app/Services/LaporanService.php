<?php

namespace App\Services;

use App\Models\Pengeluaran;
use App\Models\Tagihan;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class LaporanService
{
    public function summary(Request $request)
    {
        [$mulai, $selesai] = $this->rentangLaporan($request);

        $pemasukan = $this->tagihanDalamRentang(
            Tagihan::query()->whereNotNull('tanggal_bayar'),
            $mulai,
            $selesai
        )->sum('nominal_dibayar');

        $pengeluaran = Pengeluaran::query()
            ->whereBetween('tanggal_pengeluaran', [
                $mulai->startOfMonth()->toDateString(),
                $selesai->endOfMonth()->toDateString(),
            ])
            ->sum('nominal');

        $saldoTotal = Tagihan::query()
            ->whereNotNull('tanggal_bayar')
            ->sum('nominal_dibayar') - Pengeluaran::sum('nominal');

        return [
            'dari' => $mulai->format('Y-m'),
            'sampai' => $selesai->format('Y-m'),
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'saldo' => $pemasukan - $pengeluaran,
            'saldo_total' => $saldoTotal,

        ];
    }

    public function detail(Request $request)
    {
        [$mulai, $selesai] = $this->rentangLaporan($request);

        return [

            'pemasukan' => $this->tagihanDalamRentang(
                Tagihan::with([
                    'riwayatPenghuni.rumah',
                    'riwayatPenghuni.penghuni',
                    'jenisIuran',
                ])->whereNotNull('tanggal_bayar'),
                $mulai,
                $selesai
            )
                ->orderByDesc('tahun')
                ->orderByDesc('bulan')
                ->get(),

            'pengeluaran' => Pengeluaran::query()
                ->whereBetween('tanggal_pengeluaran', [
                    $mulai->startOfMonth()->toDateString(),
                    $selesai->endOfMonth()->toDateString(),
                ])
                ->orderByDesc('tanggal_pengeluaran')
                ->get(),

        ];
    }

    public function grafik(Request $request)
    {
        [$mulai, $selesai] = $this->rentangLaporan($request, true);

        $grafik = [];

        for ($periode = $mulai; $periode->lessThanOrEqualTo($selesai); $periode = $periode->addMonth()) {
            $bulan = $periode->month;
            $tahun = $periode->year;

            $pemasukan = $this->tagihanDalamRentang(
                Tagihan::query()->whereNotNull('tanggal_bayar'),
                $periode,
                $periode
            )
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

            $grafik[] = [
                'periode' => $periode->format('Y-m'),
                'bulan' => $bulan,
                'tahun' => $tahun,
                'pemasukan' => $pemasukan,
                'pengeluaran' => $pengeluaran,
                'saldo' => $pemasukan - $pengeluaran,

            ];
        }

        return $grafik;
    }

    private function rentangLaporan(Request $request, bool $untukGrafik = false): array
    {
        $akhir = CarbonImmutable::now()->startOfMonth();
        $rentang = $request->input('rentang');

        if (! $rentang && $request->filled('bulan')) {
            $bulan = CarbonImmutable::create(
                (int) ($request->input('tahun') ?? $akhir->year),
                (int) $request->input('bulan')
            )->startOfMonth();

            return [$bulan, $bulan];
        }

        if (! $rentang && $untukGrafik && $request->filled('tahun')) {
            $awalTahun = CarbonImmutable::create((int) $request->input('tahun'))->startOfYear();

            return [$awalTahun, $awalTahun->endOfYear()->startOfMonth()];
        }

        return match ($rentang ?? 'ytd') {
            '1_bulan' => [$akhir, $akhir],
            '3_bulan' => [$akhir->subMonths(2), $akhir],
            '6_bulan' => [$akhir->subMonths(5), $akhir],
            '1_tahun' => [$akhir->subMonths(11), $akhir],
            'custom' => [
                CarbonImmutable::createFromFormat('Y-m', $request->string('dari'))->startOfMonth(),
                CarbonImmutable::createFromFormat('Y-m', $request->string('sampai'))->startOfMonth(),
            ],
            default => [$akhir->startOfYear(), $akhir],
        };
    }

    private function tagihanDalamRentang(
        Builder $query,
        CarbonImmutable $mulai,
        CarbonImmutable $selesai
    ): Builder {
        return $query
            ->where(function (Builder $query) use ($mulai) {
                $query->where('tahun', '>', $mulai->year)
                    ->orWhere(function (Builder $query) use ($mulai) {
                        $query->where('tahun', $mulai->year)
                            ->where('bulan', '>=', $mulai->month);
                    });
            })
            ->where(function (Builder $query) use ($selesai) {
                $query->where('tahun', '<', $selesai->year)
                    ->orWhere(function (Builder $query) use ($selesai) {
                        $query->where('tahun', $selesai->year)
                            ->where('bulan', '<=', $selesai->month);
                    });
            });
    }
}
