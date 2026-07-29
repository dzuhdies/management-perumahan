<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RumahDetailResource extends JsonResource
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
            'penghuni' => $this->penghuniAktif?->penghuni
                ? [
                    'id' => $this->penghuniAktif->penghuni->id,
                    'nama_lengkap' => $this->penghuniAktif->penghuni->nama_lengkap,
                    'nomor_telepon' => $this->penghuniAktif->penghuni->nomor_telepon,
                    'foto_ktp' => $this->penghuniAktif->penghuni->foto_ktp
                        ? asset('storage/'.$this->penghuniAktif->penghuni->foto_ktp)
                        : null,
                    'status_penghuni' => $this->penghuniAktif->penghuni->status_penghuni,
                    'status_menikah' => $this->penghuniAktif->penghuni->status_menikah,
                    'tanggal_masuk' => $this->penghuniAktif->tanggal_masuk,
                ]
                : null,

            'tagihan' => TagihanResource::collection(
                $this->penghuniAktif?->tagihan ?? collect()
            ),

            'histori_penghuni' => $this->riwayatPenghuni->map(fn ($riwayat) => [
                'id' => $riwayat->id,
                'penghuni_id' => $riwayat->penghuni_id,
                'nama_lengkap' => $riwayat->penghuni?->nama_lengkap,
                'status_penghuni' => $riwayat->penghuni?->status_penghuni,
                'tanggal_masuk' => $riwayat->tanggal_masuk,
                'tanggal_keluar' => $riwayat->tanggal_keluar,
                'sedang_menempati' => $riwayat->sedang_menempati,
            ]),

        ];
    }
}
