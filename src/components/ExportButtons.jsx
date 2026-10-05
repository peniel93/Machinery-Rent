import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { exportToCSV, exportToPDF, exportToWord, printData } from '../utils/exportUtils';
import { FileText, FileSpreadsheet, FileCode, Printer } from 'lucide-react';

export const ExportButtons = ({ title, headers, rows, filename = 'export_data' }) => {
  const { t } = useLanguage();

  if (!rows || rows.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
      <button 
        type="button" 
        className="btn-secondary btn-sm"
        onClick={() => exportToCSV(filename, headers, rows)}
      >
        <FileSpreadsheet size={16} /> {t('exportCsv')}
      </button>

      <button 
        type="button" 
        className="btn-secondary btn-sm"
        onClick={() => exportToPDF(title, headers, rows)}
      >
        <FileText size={16} /> {t('exportPdf')}
      </button>

      <button 
        type="button" 
        className="btn-secondary btn-sm"
        onClick={() => exportToWord(filename, title, headers, rows)}
      >
        <FileCode size={16} /> {t('exportWord')}
      </button>

      <button 
        type="button" 
        className="btn-secondary btn-sm"
        onClick={() => printData(title, headers, rows)}
      >
        <Printer size={16} /> {t('print')}
      </button>
    </div>
  );
};
