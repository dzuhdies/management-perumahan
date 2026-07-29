<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePengeluaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal_pengeluaran' => 'required|date',
            'judul' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:1',
            'deskripsi' => 'nullable|string',
        ];
    }
}
