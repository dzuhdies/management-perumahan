<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RentangLaporanRequest;
use App\Services\DashboardService;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $service
    ) {}

    public function index(RentangLaporanRequest $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Dashboard',
            'data' => $this->service->index($request),
        ]);
    }
}
