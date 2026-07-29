<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RentangLaporanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rentang' => [
                'nullable',
                Rule::in(['1_bulan', '3_bulan', '6_bulan', '1_tahun', 'ytd', 'custom']),
            ],
            'dari' => 'required_if:rentang,custom|nullable|date_format:Y-m',
            'sampai' => 'required_if:rentang,custom|nullable|date_format:Y-m|after_or_equal:dari',
            'bulan' => 'nullable|integer|min:1|max:12',
            'tahun' => 'nullable|integer|min:2000|max:2100',
        ];
    }
}
