<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PengeluaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tanggal_pengeluaran' => $this->tanggal_pengeluaran,
            'judul' => $this->judul,
            'nominal' => (float) $this->nominal,
            'deskripsi' => $this->deskripsi,
        ];
    }
}
