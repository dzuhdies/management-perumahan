<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJenisIuranRequest;
use App\Http\Requests\UpdateJenisIuranRequest;
use App\Http\Resources\JenisIuranResource;
use App\Models\JenisIuran;
use App\Services\JenisIuranService;

class JenisIuranController extends Controller
{
    public function __construct(
        protected JenisIuranService $service
    ) {}

    public function index()
    {
        return JenisIuranResource::collection(
            $this->service->getAll()
        );
    }

    public function store(StoreJenisIuranRequest $request)
    {
        return (new JenisIuranResource(
            $this->service->store($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function update(
        UpdateJenisIuranRequest $request,
        JenisIuran $jenisIuran
    ) {
        return new JenisIuranResource(
            $this->service->update($jenisIuran, $request->validated())
        );
    }
}
