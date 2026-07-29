<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JenisIuranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_iuran' => $this->nama_iuran,
            'nominal' => (float) $this->nominal,
            'jumlah_tagihan' => $this->whenCounted('tagihan'),
        ];
    }
}
