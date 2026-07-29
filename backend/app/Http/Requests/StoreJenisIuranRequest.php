<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJenisIuranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_iuran' => 'required|string|max:255|unique:jenis_iuran,nama_iuran',
            'nominal' => 'required|numeric|min:1|max:9999999999.99',
        ];
    }
}
