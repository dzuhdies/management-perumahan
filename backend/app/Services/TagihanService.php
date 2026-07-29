<?php

namespace App\Services;

use App\Models\JenisIuran;
use App\Models\RiwayatPenghuni;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TagihanService
{
    public function getAll(array $filter)
    {
        return Tagihan::query()

            ->with([
                'riwayatPenghuni.rumah',
                'riwayatPenghuni.penghuni',
                'jenisIuran',
            ])

            ->when(
                $filter['bulan'] ?? null,
                fn ($q, $bulan) => $q->where('bulan', $bulan)
            )

            ->when(
                $filter['tahun'] ?? null,
                fn ($q, $tahun) => $q->where('tahun', $tahun)
            )

            ->when(
                $filter['status'] ?? null,
                function ($q, $status) {

                    if ($status == 'lunas') {
                        $q->whereNotNull('tanggal_bayar');
                    }

                    if ($status == 'belum_lunas') {
                        $q->whereNull('tanggal_bayar');
                    }
                }
            )

            ->when(
                $filter['rumah'] ?? null,
                function ($q, $rumah) {

                    $q->whereHas(
                        'riwayatPenghuni.rumah',
                        fn ($x) => $x->where(
                            'kode_rumah',
                            $rumah
                        )
                    );
                }
            )

            ->orderBy('tahun')

            ->orderBy('bulan')

            ->get();
    }

    public function bayar(array $data)
    {
        return DB::transaction(function () use ($data) {
            $jumlahDibayar = 0;
            $riwayat = RiwayatPenghuni::findOrFail($data['riwayat_penghuni_id']);
            $jenisIuran = JenisIuran::findOrFail($data['jenis_iuran_id']);

            for ($i = 0; $i < $data['jumlah_bulan']; $i++) {

                $bulan = $data['bulan'] + $i;

                $tahun = $data['tahun'];

                while ($bulan > 12) {

                    $bulan -= 12;

                    $tahun++;
                }

                $tagihan = Tagihan::firstOrCreate(
                    [
                        'riwayat_penghuni_id' => $riwayat->id,
                        'jenis_iuran_id' => $jenisIuran->id,
                        'bulan' => $bulan,
                        'tahun' => $tahun,
                    ],
                    [
                        'nominal' => $jenisIuran->nominal,
                        'nominal_dibayar' => 0,
                    ]
                );

                $tagihan->update([
                    'tanggal_bayar' => $data['tanggal_bayar'],
                    'nominal_dibayar' => $tagihan->nominal,
                ]);

                $jumlahDibayar++;
            }

            return $jumlahDibayar;
        });
    }

    public function generate(array $data)
    {
        DB::transaction(function () use ($data) {

            $penghuniAktif = RiwayatPenghuni::query()
                ->where('sedang_menempati', true)
                ->whereDate(
                    'tanggal_masuk',
                    '<=',
                    Carbon::create($data['tahun'], $data['bulan'])
                        ->endOfMonth()
                        ->toDateString()
                )
                ->get();

            $jenisIuran = JenisIuran::all();

            foreach ($penghuniAktif as $riwayat) {

                foreach ($jenisIuran as $iuran) {

                    Tagihan::firstOrCreate(

                        [
                            'riwayat_penghuni_id' => $riwayat->id,
                            'jenis_iuran_id' => $iuran->id,
                            'bulan' => $data['bulan'],
                            'tahun' => $data['tahun'],
                        ],

                        [
                            'nominal' => $iuran->nominal,
                            'nominal_dibayar' => 0,
                        ]
                    );
                }
            }
        });
    }
}
