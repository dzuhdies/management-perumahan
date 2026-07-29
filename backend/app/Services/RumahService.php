<?php

namespace App\Services;

use App\Models\Rumah;
use App\Models\Tagihan;

class RumahService
{
    public function getAll()
    {
        return Rumah::with([
            'penghuniAktif.penghuni',
            'penghuniAktif.tagihan' => fn ($query) => $query
                ->where('bulan', now()->month)
                ->where('tahun', now()->year),
        ])
            ->orderBy('urutan_tampil')
            ->get();
    }

    public function detail(Rumah $rumah)
    {
        return $rumah->load([
            'penghuniAktif.penghuni',
            'penghuniAktif.tagihan' => fn ($query) => $query
                ->with('jenisIuran')
                ->orderByDesc('tahun')
                ->orderByDesc('bulan'),
            'riwayatPenghuni' => fn ($query) => $query
                ->with('penghuni')
                ->orderByDesc('tanggal_masuk'),
        ]);
    }

    public function store(array $data): Rumah
    {
        $rumah = Rumah::create([
            ...$data,
            'status' => 'kosong',
        ]);

        return $this->detail($rumah);
    }

    public function update(Rumah $rumah, array $data): Rumah
    {
        $rumah->update($data);

        return $this->detail($rumah->refresh());
    }

    public function pembayaran(Rumah $rumah)
    {
        return Tagihan::query()
            ->with([
                'riwayatPenghuni.rumah',
                'riwayatPenghuni.penghuni',
                'jenisIuran',
            ])
            ->whereHas(
                'riwayatPenghuni',
                fn ($query) => $query->where('rumah_id', $rumah->id)
            )
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->orderBy('jenis_iuran_id')
            ->get();
    }
}
