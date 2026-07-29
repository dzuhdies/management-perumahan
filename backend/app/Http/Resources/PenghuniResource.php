<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PenghuniResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $riwayatAktif = $this->riwayatPenghuni
            ->where('sedang_menempati', true)
            ->first();

        return [

            'id' => $this->id,

            'nama_lengkap' => $this->nama_lengkap,

            'nomor_telepon' => $this->nomor_telepon,

            'status_penghuni' => $this->status_penghuni,

            'status_menikah' => $this->status_menikah,

            'foto_ktp' => $this->foto_ktp
                ? asset('storage/'.$this->foto_ktp)
                : null,

            'rumah_id' => $riwayatAktif?->rumah_id,

            'rumah' => $riwayatAktif?->rumah?->kode_rumah,

            'tanggal_masuk' => $riwayatAktif?->tanggal_masuk,
        ];
    }
}
