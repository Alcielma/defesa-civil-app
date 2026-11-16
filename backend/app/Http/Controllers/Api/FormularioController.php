<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

            'localizacao'                         => 'required',
            'causas_problemas'                    => 'nullable',

            'num_pavimentos'                      => 'nullable|integer',
            'area_aproximada'                     => 'nullable|numeric',
            'num_comodos'                         => 'nullable|integer',
            'num_dormitorios'                     => 'nullable|integer',
            'tempo_construcao_anos'               => 'nullable|integer',
            'piso'                                => 'nullable',
            'piso_especificacao'                  => 'nullable',
            'situacao_piso'                       => 'nullable',
            'estrutura'                           => 'nullable',
            'vedacao'                             => 'nullable',
            'vedacao_especificacao'               => 'nullable',
            'situacao_parede'                     => 'nullable',

            'revestimento_externo'                => 'nullable',
            'revestimento_externo_especificacao'  => 'nullable',
            'percentual_revestimento_externo'     => 'nullable',
            'percentual_revestimento_interno'     => 'nullable',
            'revestimento_interno'                => 'nullable',
            'revestimento_interno_especificacao'  => 'nullable',
            'cobertura'                           => 'nullable',
            'cobertura_especificacao'             => 'nullable',

            'conservacao_cobertura'               => 'nullable',
            'conservacao_edificacao'              => 'nullable',
            'instalacao_eletrica'                 => 'nullable',
            'sanitario'                           => 'nullable',
            'sanitario_especificacao'             => 'nullable',

            'destino_esgoto_primario'             => 'nullable',
            'destino_esgoto_primario_especificacao'=> 'nullable',
            'destino_aguas_servidas'              => 'nullable',
            'destino_aguas_servidas_especificacao'=> 'nullable',
            'destino_lixo'                        => 'nullable',
            'destino_lixo_especificacao'          => 'nullable',

            'intervencao_parede'                  => 'nullable',
            'intervencao_coberta'                 => 'nullable',
            'indicacao_atuacao'                   => 'nullable',
            'indicacao_demolicao'                 => 'nullable',
            'intervencao_piso'                    => 'nullable',

            'observacoes'                         => 'nullable|string',

            'motivo_remocao'                      => 'nullable',
            'motivo_remocao_especificacao'        => 'nullable',
            'encaminhamentos'                     => 'nullable',

            'grau_risco'                          => 'nullable',

            'analista_tecnico'                    => 'nullable|string|max:255',
            'chefia_gerente'                      => 'nullable|string|max:255',
            'data_conclusao'                      => 'nullable|date',

            'preenchido_em'                       => 'nullable|date',
            'pdf_path'                            => 'nullable|string',
            'fotos'                               => 'nullable',
        ]);

        $validated['user_id'] = $request->user()->id;

        $formulario = Formulario::create($validated);

        $fotos = is_array($formulario->fotos) ? $formulario->fotos : [];
        foreach ($request->all() as $campo => $valor) {
            if (is_string($valor) && str_starts_with($valor, 'data:image/')) {
                $path = $this->saveBase64Image($valor, $campo, $formulario->id);
                if ($path) {
                    $fotos[$campo] = $path;
                }
            }
        }
        foreach ($request->allFiles() as $campo => $file) {
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = "vistoria_{$formulario->id}_{$campo}_" . time() . '_' . Str::random(6) . ".{$ext}";
            $path = $file->storeAs('vistorias/fotos', $filename, 'public');
            $fotos[$campo] = $path;
        }
        if (!empty($fotos)) {
            $formulario->update(['fotos' => $fotos]);
        }

        return response()->json([
            'message'    => 'Formulário recebido e salvo com sucesso!',
            'formulario' => $formulario->fresh(),
        ], 201);
    }

    public function index(Request $request)
    {
        Log::info('Buscando formulários para usuário: ' . $request->user()->id);
        
        $formularios = Formulario::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $formularios
        ]);
    }

    public function show(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'data' => $formulario
        ]);
    }

    public function update(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'localidade'                          => 'sometimes|required|string|max:255',
            'setor'                               => 'nullable|string|max:255',
            'titular'                             => 'sometimes|required|string|max:255',
            'endereco'                            => 'sometimes|required|string|max:255',
            'numero'                              => 'nullable|string|max:20',

            'localizacao'                         => 'sometimes|required',
            'causas_problemas'                    => 'nullable',

            'num_pavimentos'                      => 'nullable|integer',
            'area_aproximada'                     => 'nullable|numeric',
            'num_comodos'                         => 'nullable|integer',
            'num_dormitorios'                     => 'nullable|integer',
            'tempo_construcao_anos'               => 'nullable|integer',
            'piso'                                => 'nullable',
            'piso_especificacao'                  => 'nullable',
            'situacao_piso'                       => 'nullable',
            'estrutura'                           => 'nullable',
            'vedacao'                             => 'nullable',
            'vedacao_especificacao'               => 'nullable',
            'situacao_parede'                     => 'nullable',

            'revestimento_externo'                => 'nullable',
            'revestimento_externo_especificacao'  => 'nullable',
            'percentual_revestimento_externo'     => 'nullable',
            'percentual_revestimento_interno'     => 'nullable',
            'revestimento_interno'                => 'nullable',
            'revestimento_interno_especificacao'  => 'nullable',
            'cobertura'                           => 'nullable',
            'cobertura_especificacao'             => 'nullable',

            'conservacao_cobertura'               => 'nullable',
            'conservacao_edificacao'              => 'nullable',
            'instalacao_eletrica'                 => 'nullable',
            'sanitario'                           => 'nullable',
            'sanitario_especificacao'             => 'nullable',

            'destino_esgoto_primario'             => 'nullable',
            'destino_esgoto_primario_especificacao'=> 'nullable',
            'destino_aguas_servidas'              => 'nullable',
            'destino_aguas_servidas_especificacao'=> 'nullable',
            'destino_lixo'                        => 'nullable',
            'destino_lixo_especificacao'          => 'nullable',

            'intervencao_parede'                  => 'nullable',
            'intervencao_coberta'                 => 'nullable',
            'indicacao_atuacao'                   => 'nullable',
            'indicacao_demolicao'                 => 'nullable',
            'intervencao_piso'                    => 'nullable',

            'observacoes'                         => 'nullable|string',

            'motivo_remocao'                      => 'nullable',
            'motivo_remocao_especificacao'        => 'nullable',
            'encaminhamentos'                     => 'nullable',

            'grau_risco'                          => 'nullable',

            'analista_tecnico'                    => 'nullable|string|max:255',
            'chefia_gerente'                      => 'nullable|string|max:255',
            'data_conclusao'                      => 'nullable|date',

            'preenchido_em'                       => 'nullable|date',
            'pdf_path'                            => 'nullable|string',
            'fotos'                               => 'nullable',
        ]);

        $formulario->update($validated);

        $fotos = is_array($formulario->fotos) ? $formulario->fotos : [];
        foreach ($request->all() as $campo => $valor) {
            if (is_string($valor) && str_starts_with($valor, 'data:image/')) {
                if (!empty($fotos[$campo]) && Storage::disk('public')->exists($fotos[$campo])) {
                    Storage::disk('public')->delete($fotos[$campo]);
                }
                $path = $this->saveBase64Image($valor, $campo, $formulario->id);
                if ($path) {
                    $fotos[$campo] = $path;
                }
            }
        }
        foreach ($request->allFiles() as $campo => $file) {
            if (!empty($fotos[$campo]) && Storage::disk('public')->exists($fotos[$campo])) {
                Storage::disk('public')->delete($fotos[$campo]);
            }
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = "vistoria_{$formulario->id}_{$campo}_" . time() . '_' . Str::random(6) . ".{$ext}";
            $path = $file->storeAs('vistorias/fotos', $filename, 'public');
            $fotos[$campo] = $path;
        }
        $formulario->update(['fotos' => $fotos]);

        return response()->json([
            'message'    => 'Formulário atualizado com sucesso!',
            'formulario' => $formulario->fresh(),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($formulario->pdf_path && Storage::disk('public')->exists($formulario->pdf_path)) {
            Storage::disk('public')->delete($formulario->pdf_path);
        }

        if (is_array($formulario->fotos)) {
            foreach ($formulario->fotos as $fotoPath) {
                if ($fotoPath && Storage::disk('public')->exists($fotoPath)) {
                    Storage::disk('public')->delete($fotoPath);
                }
            }
        }

        $formulario->delete();

        return response()->json([
            'message' => 'Formulário e arquivos associados excluídos com sucesso!'
        ]);
    }

    public function uploadPdf(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $savedPath = null;

        if ($request->hasFile('pdf')) {
            $request->validate([
                'pdf' => 'required|file|mimes:pdf|max:20480',
            ]);
            $file = $request->file('pdf');
            $filename = "vistoria_{$formulario->id}_" . time() . '_' . Str::random(6) . '.pdf';
            $savedPath = $file->storeAs('vistorias/pdfs', $filename, 'public');
        } elseif ($request->filled('pdf_base64')) {
            $savedPath = $this->saveBase64Pdf($request->input('pdf_base64'), $formulario->id);
            if (!$savedPath) {
                return response()->json(['message' => 'Arquivo PDF em base64 inválido.'], 422);
            }
        } else {
            return response()->json([
                'message' => 'Nenhum PDF fornecido. Envie um arquivo no campo "pdf" ou uma string base64 no campo "pdf_base64".'
            ], 422);
        }

        if ($formulario->pdf_path && $formulario->pdf_path !== $savedPath && Storage::disk('public')->exists($formulario->pdf_path)) {
            Storage::disk('public')->delete($formulario->pdf_path);
        }

        $formulario->update(['pdf_path' => $savedPath]);

        return response()->json([
            'message'  => 'PDF da vistoria salvo com sucesso!',
            'pdf_path' => $savedPath,
            'pdf_url'  => asset('storage/' . $savedPath),
        ]);
    }

    public function downloadPdf(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (!$formulario->pdf_path || !Storage::disk('public')->exists($formulario->pdf_path)) {
            return response()->json(['message' => 'PDF não encontrado para esta vistoria.'], 404);
        }

        $nomeArquivo = 'Vistoria_' . Str::slug($formulario->titular ?? 'vistoria') . "_{$formulario->id}.pdf";
        return Storage::disk('public')->response($formulario->pdf_path, $nomeArquivo);
    }

    public function deletePdf(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($formulario->pdf_path && Storage::disk('public')->exists($formulario->pdf_path)) {
            Storage::disk('public')->delete($formulario->pdf_path);
        }

        $formulario->update(['pdf_path' => null]);

        return response()->json([
            'message' => 'PDF excluído com sucesso!'
        ]);
    }

    public function uploadFotos(Request $request, $id)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $fotosAtuais = is_array($formulario->fotos) ? $formulario->fotos : [];
        $novasFotosSalvas = [];

        foreach ($request->allFiles() as $campo => $file) {
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = "vistoria_{$formulario->id}_{$campo}_" . time() . '_' . Str::random(6) . ".{$ext}";
            $path = $file->storeAs('vistorias/fotos', $filename, 'public');

            if (!empty($fotosAtuais[$campo]) && Storage::disk('public')->exists($fotosAtuais[$campo])) {
                Storage::disk('public')->delete($fotosAtuais[$campo]);
            }

            $fotosAtuais[$campo] = $path;
            $novasFotosSalvas[$campo] = $path;
        }

        $inputs = $request->input('fotos', $request->except(['_token', '_method']));
        if (is_array($inputs)) {
            foreach ($inputs as $campo => $valor) {
                if (is_string($valor) && str_starts_with($valor, 'data:image/')) {
                    $path = $this->saveBase64Image($valor, $campo, $formulario->id);
                    if ($path) {
                        if (!empty($fotosAtuais[$campo]) && Storage::disk('public')->exists($fotosAtuais[$campo])) {
                            Storage::disk('public')->delete($fotosAtuais[$campo]);
                        }
                        $fotosAtuais[$campo] = $path;
                        $novasFotosSalvas[$campo] = $path;
                    }
                }
            }
        }

        $formulario->update(['fotos' => $fotosAtuais]);

        return response()->json([
            'message'    => 'Fotos salvas com sucesso!',
            'total'      => count($fotosAtuais),
            'fotos'      => $formulario->fotos,
            'fotos_urls' => $formulario->fotos_urls,
        ]);
    }

    public function deleteFoto(Request $request, $id, $campo)
    {
        $formulario = Formulario::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $fotosAtuais = is_array($formulario->fotos) ? $formulario->fotos : [];

        if (empty($fotosAtuais[$campo])) {
            return response()->json(['message' => "Foto '{$campo}' não encontrada."], 404);
        }

        $caminho = $fotosAtuais[$campo];
        if (Storage::disk('public')->exists($caminho)) {
            Storage::disk('public')->delete($caminho);
        }

        unset($fotosAtuais[$campo]);
        $formulario->update(['fotos' => $fotosAtuais]);

        return response()->json([
            'message'    => "Foto '{$campo}' removida com sucesso!",
            'fotos'      => $formulario->fotos,
            'fotos_urls' => $formulario->fotos_urls,
        ]);
    }

    private function saveBase64Image(string $base64Data, string $prefix, int $formularioId): ?string
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            $data = substr($base64Data, strpos($base64Data, ',') + 1);
            $type = strtolower($type[1]);
            if ($type === 'jpeg') {
                $type = 'jpg';
            }
            $decoded = base64_decode($data);
            if ($decoded === false) {
                return null;
            }

            $safePrefix = preg_replace('/[^a-zA-Z0-9_-]/', '_', $prefix);
            $filename = "vistorias/fotos/vistoria_{$formularioId}_{$safePrefix}_" . time() . '_' . Str::random(6) . ".{$type}";
            Storage::disk('public')->put($filename, $decoded);
            return $filename;
        }
        return null;
    }

    private function saveBase64Pdf(string $base64Data, int $formularioId): ?string
    {
        $data = $base64Data;
        if (str_contains($base64Data, ',')) {
            $data = substr($base64Data, strpos($base64Data, ',') + 1);
        }
        $decoded = base64_decode($data);
        if ($decoded === false) {
            return null;
        }

        $filename = "vistorias/pdfs/vistoria_{$formularioId}_" . time() . '_' . Str::random(6) . ".pdf";
        Storage::disk('public')->put($filename, $decoded);
        return $filename;
    }
}
