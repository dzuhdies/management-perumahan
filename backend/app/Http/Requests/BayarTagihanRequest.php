<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BayarTagihanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'riwayat_penghuni_id' => 'required|exists:riwayat_penghuni,id',
            'jenis_iuran_id' => 'required|exists:jenis_iuran,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2000|max:2100',
            'jumlah_bulan' => 'required|integer|min:1|max:12',
            'tanggal_bayar' => 'required|date',
        ];
    }
}
