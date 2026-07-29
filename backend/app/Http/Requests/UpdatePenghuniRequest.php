<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePenghuniRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_lengkap' => 'required|max:150',
            'nomor_telepon' => 'required|max:20',
            'foto_ktp' => 'nullable|image|max:2048',
            'status_penghuni' => 'required|in:tetap,kontrak',
            'status_menikah' => 'required|boolean',
        ];
    }
}
