<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePenghuniRequest;
use App\Http\Requests\UpdatePenghuniRequest;
use App\Http\Resources\PenghuniResource;
use App\Models\Penghuni;
use App\Services\PenghuniService;

class PenghuniController extends Controller
{
    public function __construct(
        protected PenghuniService $service
    ) {}

    public function index()
    {
        return PenghuniResource::collection(
            $this->service->getAll()
        );
    }

    public function store(StorePenghuniRequest $request)
    {
        $penghuni = $this->service->store(
            $request->validated()
        );

        return (new PenghuniResource(
            $penghuni->load('riwayatPenghuni.rumah')
        ))->response()->setStatusCode(201);
    }

    public function show(Penghuni $penghuni)
    {
        return new PenghuniResource($penghuni);
    }

    public function update(
        UpdatePenghuniRequest $request,
        Penghuni $penghuni
    ) {

        return new PenghuniResource(

            $this->service->update(
                $penghuni,
                $request->validated()
            )

        );
    }

    public function destroy(Penghuni $penghuni)
    {
        $this->service->destroy($penghuni);

        return response()->json([
            'success' => true,
            'message' => 'Penghuni berhasil dikeluarkan dari rumah. Riwayat tetap tersimpan.',
        ]);
    }
}
