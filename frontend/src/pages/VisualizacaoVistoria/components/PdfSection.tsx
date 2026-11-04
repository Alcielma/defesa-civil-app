import React from 'react';

interface PdfSectionProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const PdfSection: React.FC<PdfSectionProps> = ({ title, children, style }) => (
  <section className="pdf-section" style={style}>
    <h2 className="pdf-section-title">{title}</h2>
    {children}
  </section>
);

interface PdfFieldRowProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  wrap?: boolean;
  style?: React.CSSProperties;
}

export const PdfFieldRow: React.FC<PdfFieldRowProps> = ({ label, value, unit, wrap, style }) => (
  <div className={`pdf-field-row ${wrap ? 'pdf-field-row--wrap' : ''}`} style={style}>
    <span className="pdf-label">{label}:</span>
    <span className="pdf-value">{value}</span>
    {unit && <span className="pdf-unit">{unit}</span>}
  </div>
);
