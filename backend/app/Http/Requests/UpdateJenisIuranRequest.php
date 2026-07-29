<?php

namespace App\Http\Requests;

use App\Models\JenisIuran;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJenisIuranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var JenisIuran $jenisIuran */
        $jenisIuran = $this->route('jenis_iuran');

        return [
            'nama_iuran' => [
                'required',
                'string',
                'max:255',
                Rule::unique('jenis_iuran', 'nama_iuran')->ignore($jenisIuran),
            ],
            'nominal' => 'required|numeric|min:1|max:9999999999.99',
        ];
    }
}
