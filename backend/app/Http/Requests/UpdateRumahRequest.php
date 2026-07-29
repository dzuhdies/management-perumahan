<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRumahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rumah = $this->route('rumah');

        return [
            'kode_rumah' => [
                'required',
                'string',
                'max:20',
                Rule::unique('rumah', 'kode_rumah')->ignore($rumah),
            ],
            'baris_denah' => ['required', 'integer', 'min:1', 'max:20'],
            'kolom_denah' => [
                'required',
                'integer',
                'min:1',
                'max:100',
                Rule::unique('rumah', 'kolom_denah')
                    ->where(fn ($query) => $query->where('baris_denah', $this->integer('baris_denah')))
                    ->ignore($rumah),
            ],
            'urutan_tampil' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('rumah', 'urutan_tampil')->ignore($rumah),
            ],
        ];
    }
}
