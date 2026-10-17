type Props = {
  busy?: boolean;
  disabled?: boolean;
  hint?: string;
  onFile: (file: File | null) => void;
};

export function SchedulingUploader({ busy, disabled, hint, onFile }: Props) {
  return (
    <div className="dropzone">
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        disabled={busy || disabled}
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      <p className="muted">
        {busy
          ? "Processando…"
          : hint ||
            "Envie AGENDAMENTOS, INSUCESSOS ou LEADS GERAL (.xlsx/.csv). Importação acumulativa por ID."}
      </p>
    </div>
  );
}
