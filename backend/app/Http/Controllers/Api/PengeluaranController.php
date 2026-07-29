<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePengeluaranRequest;
use App\Http\Requests\UpdatePengeluaranRequest;
use App\Http\Resources\PengeluaranResource;
use App\Models\Pengeluaran;
use App\Services\PengeluaranService;

class PengeluaranController extends Controller
{
    public function __construct(
        protected PengeluaranService $service
    ) {}

    public function index()
    {
        return PengeluaranResource::collection(
            $this->service->getAll()
        );
    }

    public function store(StorePengeluaranRequest $request)
    {
        return (new PengeluaranResource(
            $this->service->store($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function show(Pengeluaran $pengeluaran)
    {
        return new PengeluaranResource($pengeluaran);
    }

    public function update(
        UpdatePengeluaranRequest $request,
        Pengeluaran $pengeluaran
    ) {
        return new PengeluaranResource(
            $this->service->update($pengeluaran, $request->validated())
        );
    }

    public function destroy(Pengeluaran $pengeluaran)
    {
        $this->service->delete($pengeluaran);

        return response()->json([
            'success' => true,
            'message' => 'Pengeluaran berhasil dihapus.',
        ]);
    }
}
