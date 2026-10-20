<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulario;
use Illuminate\Http\Request;

class FormularioController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'localidade'                          => 'required|string|max:255',
            'setor'                               => 'nullable|string|max:255',
            'titular'                             => 'required|string|max:255',
            'endereco'                            => 'required|string|max:255',
            'numero'                              => 'nullable|string|max:20',

            'localizacao'                         => 'required|string|max:255',
            'causas_problemas'                    => 'nullable|array',
            'causas_problemas.*'                  => 'string',

            'num_pavimentos'                      => 'nullable|integer',
            'area_aproximada'                     => 'nullable|numeric',
            'num_comodos'                         => 'nullable|integer',
            'num_dormitorios'                     => 'nullable|integer',
            'tempo_construcao_anos'               => 'nullable|integer',
            'piso'                                => 'nullable|string|max:255',
            'piso_especificacao'                  => 'nullable|string|max:255',
            'situacao_piso'                       => 'nullable|string|max:255',
            'estrutura'                           => 'nullable|string|max:255',
            'vedacao'                             => 'nullable|string|max:255',
            'vedacao_especificacao'               => 'nullable|string|max:255',
            'situacao_parede'                     => 'nullable|string|max:255',

            'revestimento_externo'                => 'nullable|string|max:255',
            'revestimento_externo_especificacao'  => 'nullable|string|max:255',
            'percentual_revestimento_interno'     => 'nullable|string|max:255',
            'revestimento_interno'                => 'nullable|string|max:255',
            'revestimento_interno_especificacao'  => 'nullable|string|max:255',
            'cobertura'                           => 'nullable|string|max:255',
            'cobertura_especificacao'             => 'nullable|string|max:255',

            'conservacao_cobertura'               => 'nullable|string|max:255',
            'conservacao_edificacao'              => 'nullable|string|max:255',
            'instalacao_eletrica'                 => 'nullable|string|max:255',
            'sanitario'                           => 'nullable|string|max:255',
            'sanitario_especificacao'             => 'nullable|string|max:255',

            'destino_esgoto_primario'             => 'nullable|string|max:255',
            'destino_esgoto_primario_especificacao'=> 'nullable|string|max:255',
            'destino_aguas_servidas'              => 'nullable|string|max:255',
            'destino_aguas_servidas_especificacao'=> 'nullable|string|max:255',
            'destino_lixo'                        => 'nullable|string|max:255',
            'destino_lixo_especificacao'          => 'nullable|string|max:255',

            'intervencao_parede'                  => 'nullable|string|max:255',
            'intervencao_coberta'                 => 'nullable|string|max:255',
            'indicacao_atuacao'                   => 'nullable|string|max:255',
            'indicacao_demolicao'                 => 'nullable|string|max:255',
            'intervencao_piso'                    => 'nullable|string|max:255',

            'observacoes'                         => 'nullable|string',

            'motivo_remocao'                      => 'nullable|string|max:255',
            'motivo_remocao_especificacao'        => 'nullable|string|max:255',
            'encaminhamentos'                     => 'nullable|string|max:255',

            'grau_risco'                          => 'nullable|string|max:255',

            'analista_tecnico'                    => 'nullable|string|max:255',
            'chefia_gerente'                      => 'nullable|string|max:255',
            'data_conclusao'                      => 'nullable|date',

            'preenchido_em'                       => 'nullable|date',
        ]);

        $validated['user_id'] = $request->user()->id;

        $formulario = Formulario::create($validated);

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
