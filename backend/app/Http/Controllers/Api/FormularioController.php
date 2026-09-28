<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulario;
use Illuminate\Http\Request;

class FormularioController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'localidade'           => 'required|string|max:255',
            'setor'                => 'nullable|string|max:255',
            'titular'              => 'required|string|max:255',
            'endereco'             => 'required|string|max:255',
            'numero'               => 'nullable|string|max:20',

            'localizacao'          => 'required|in:planicie_corrego,encosta,topo_de_encosta',
            'causas_problemas'     => 'nullable|array',
            'causas_problemas.*'   => 'string',

            'num_pavimentos'       => 'nullable|integer',
            'area_aproximada'      => 'nullable|numeric',
            'num_comodos'          => 'nullable|integer',
            'num_dormitorios'      => 'nullable|integer',
            'tempo_construcao_anos'=> 'nullable|integer',
            'piso'                 => 'required|in:terra_batida,ceramica,madeira,cimento,outro',
            'piso_especificacao'   => 'nullable|string|max:255',
            'situacao_piso'        => 'required|in:abatimento,rachadura',

            'preenchido_em'        => 'nullable|date',
        ]);

        $formulario = Formulario::create([
            'user_id'              => $request->user()->id,

            'localidade'           => $request->localidade,
            'setor'                => $request->setor,
            'titular'              => $request->titular,
            'endereco'             => $request->endereco,
            'numero'               => $request->numero,

            'localizacao'          => $request->localizacao,
            'causas_problemas'     => $request->causas_problemas,

            'num_pavimentos'       => $request->num_pavimentos,
            'area_aproximada'      => $request->area_aproximada,
            'num_comodos'          => $request->num_comodos,
            'num_dormitorios'      => $request->num_dormitorios,
            'tempo_construcao_anos'=> $request->tempo_construcao_anos,
            'piso'                 => $request->piso,
            'piso_especificacao'   => $request->piso_especificacao,
            'situacao_piso'        => $request->situacao_piso,
            'preenchido_em'        => $request->preenchido_em,
        ]);

        return response()->json([
            'message'    => 'Formulário recebido e salvo com sucesso!',
            'formulario' => $formulario,
        ], 201);
    }

    public function index(Request $request)
    {
        $formularios = Formulario::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($formularios);
    }

    public function show(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json($formulario);
    }
}
