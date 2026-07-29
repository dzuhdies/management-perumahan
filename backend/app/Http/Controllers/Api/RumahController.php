<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRumahRequest;
use App\Http\Requests\UpdateRumahRequest;
use App\Http\Resources\RumahDetailResource;
use App\Http\Resources\RumahResource;
use App\Http\Resources\TagihanResource;
use App\Models\Rumah;
use App\Services\RumahService;

class RumahController extends Controller
{
    public function __construct(
        protected RumahService $service
    ) {}

    public function index()
    {
        return RumahResource::collection(
            $this->service->getAll()
        );
    }

    public function store(StoreRumahRequest $request)
    {
        return (new RumahDetailResource(
            $this->service->store($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function show(Rumah $rumah)
    {
        return new RumahDetailResource(
            $this->service->detail($rumah)
        );
    }

    public function update(UpdateRumahRequest $request, Rumah $rumah)
    {
        return new RumahDetailResource(
            $this->service->update($rumah, $request->validated())
        );
    }

    public function pembayaran(Rumah $rumah)
    {
        return TagihanResource::collection(
            $this->service->pembayaran($rumah)
        );
    }
}
