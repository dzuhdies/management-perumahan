<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RumahResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,
            'kode_rumah' => $this->kode_rumah,
            'status' => $this->status,
            'baris_denah' => $this->baris_denah,
            'kolom_denah' => $this->kolom_denah,
            'urutan_tampil' => $this->urutan_tampil,
            'warna' => $this->getWarna(),
            'status_pembayaran' => $this->getStatusPembayaran(),
            'penghuni' => $this->penghuniAktif?->penghuni
                ? [
                    'id' => $this->penghuniAktif->penghuni->id,
                    'nama' => $this->penghuniAktif->penghuni->nama_lengkap,
                    'nomor_telepon' => $this->penghuniAktif->penghuni->nomor_telepon,
                    'tanggal_masuk' => $this->penghuniAktif->tanggal_masuk,
                ]
                : null,
        ];
    }

    private function getWarna(): string
    {
        if ($this->status == 'kosong') {
            return 'gray';
        }

        return $this->getStatusPembayaran() === 'lunas' ? 'green' : 'red';
    }

    private function getStatusPembayaran(): string
    {
        if ($this->status === 'kosong') {
            return 'tidak_ada_penghuni';
        }

        $tagihan = $this->penghuniAktif?->tagihan ?? collect();

        if ($tagihan->isEmpty() || $tagihan->contains(fn ($item) => is_null($item->tanggal_bayar))) {
            return 'belum_lunas';
        }

        return 'lunas';
    }
}
