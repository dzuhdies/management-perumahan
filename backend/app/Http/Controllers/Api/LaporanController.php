<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RentangLaporanRequest;
use App\Services\LaporanService;

class LaporanController extends Controller
{
    public function __construct(
        protected LaporanService $service
    ) {}

    public function summary(RentangLaporanRequest $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->summary($request),
        ]);
    }

    public function detail(RentangLaporanRequest $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->detail($request),
        ]);
    }

    public function grafik(RentangLaporanRequest $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->grafik($request),
        ]);
    }
}
