import React from 'react';

interface PdfHeaderProps {
  localidade?: string;
  setor?: string;
  titular?: string;
  endereco?: string;
  numero?: string;
  showFullIdentificacao?: boolean;
}

export const PdfHeader: React.FC<PdfHeaderProps> = ({
  localidade,
  setor,
  titular,
  endereco,
  numero,
  showFullIdentificacao = true
}) => (
  <header className="pdf-header">
    <div className="pdf-logo">
      <img src="/logo-defesa-civil.png" alt="Defesa Civil Garanhuns" />
    </div>
    <div className="pdf-identificacao">
      {showFullIdentificacao ? (
        <>
          <div className="pdf-field-row">
            <span className="pdf-label">LOCALIDADE:</span>
            <span className="pdf-value">{localidade}</span>
            <span className="pdf-label">SETOR:</span>
            <span className="pdf-value">{setor}</span>
          </div>
          <div className="pdf-field-row">
            <span className="pdf-label">TITULAR:</span>
            <span className="pdf-value">{titular}</span>
          </div>
          <div className="pdf-field-row">
            <span className="pdf-label">ENDEREÇO:</span>
            <span className="pdf-value">{endereco}</span>
            <span className="pdf-label">Nº:</span>
            <span className="pdf-value">{numero}</span>
          </div>
        </>
      ) : (
        <>
          <div className="pdf-field-row">
            <span className="pdf-label">IDENTIFICAÇÃO:</span>
            <span className="pdf-value">{titular}</span>
          </div>
          <div className="pdf-field-row">
            <span className="pdf-label">ENDEREÇO:</span>
            <span className="pdf-value">{endereco}</span>
          </div>
        </>
      )}
    </div>
  </header>
);
