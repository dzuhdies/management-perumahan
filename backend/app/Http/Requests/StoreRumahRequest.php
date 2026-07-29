<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRumahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_rumah' => ['required', 'string', 'max:20', 'unique:rumah,kode_rumah'],
            'baris_denah' => ['required', 'integer', 'min:1', 'max:20'],
            'kolom_denah' => [
                'required',
                'integer',
                'min:1',
                'max:100',
                Rule::unique('rumah', 'kolom_denah')
                    ->where(fn ($query) => $query->where('baris_denah', $this->integer('baris_denah'))),
            ],
            'urutan_tampil' => ['required', 'integer', 'min:1', 'unique:rumah,urutan_tampil'],
        ];
    }
}
