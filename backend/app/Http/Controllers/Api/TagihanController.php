<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BayarTagihanRequest;
use App\Http\Requests\GenerateTagihanRequest;
use App\Http\Resources\TagihanResource;
use App\Services\TagihanService;
use Illuminate\Http\Request;

class TagihanController extends Controller
{
    public function __construct(
        protected TagihanService $service
    ) {}

    public function index(Request $request)
    {
        return TagihanResource::collection(

            $this->service->getAll(

                $request->all()

            )

        );
    }

    public function bayar(
        BayarTagihanRequest $request
    ) {

        $jumlahDibayar = $this->service->bayar(

            $request->validated()

        );

        return response()->json([

            'success' => true,
            'message' => 'Pembayaran berhasil.',
            'data' => ['jumlah_tagihan' => $jumlahDibayar],

        ]);
    }

    public function generate(GenerateTagihanRequest $request)
    {
        $this->service->generate(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Tagihan berhasil dibuat.',
        ]);
    }
}
