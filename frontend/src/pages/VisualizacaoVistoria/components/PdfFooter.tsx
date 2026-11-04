import React from 'react';

interface PdfFooterProps {
  analistaTecnico?: string;
  chefiaGerente?: string;
}

export const PdfFooter: React.FC<PdfFooterProps> = ({
  analistaTecnico,
  chefiaGerente
}) => (
  <footer className="pdf-footer-content" style={{ marginTop: 'auto', paddingBottom: '40px' }}>
    <div className="pdf-grid-2">
      <div className="pdf-column" style={{ alignItems: 'center' }}>
        <div style={{ width: '80%', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
        <span className="pdf-label">ANALISTA TÉCNICO</span>
        <span className="pdf-value">{analistaTecnico || '______________________'}</span>
      </div>
      <div className="pdf-column" style={{ alignItems: 'center' }}>
        <div style={{ width: '80%', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
        <span className="pdf-label">CHEFIA / GERENTE</span>
        <span className="pdf-value">{chefiaGerente || '______________________'}</span>
      </div>
    </div>
  </footer>
);
