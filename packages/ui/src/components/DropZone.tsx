import { useRef, useState } from "preact/hooks";
import { t, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  accept: string[];
  multiple: boolean;
  files: File[];
  onFiles(files: File[]): void;
}

export function DropZone({ locale, accept, multiple, files, onFiles }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const pick = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list);
    onFiles(multiple ? [...files, ...next] : next.slice(0, 1));
  };

  return (
    <div>
      <div
        class="ff-drop"
        role="button"
        tabIndex={0}
        aria-label={t(locale, "common.dropHere")}
        data-over={over}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer?.files ?? null); }}
      >
        <strong>{t(locale, "common.dropHere")}</strong>
        <div class="ff-note">{accept.filter((a) => a.startsWith(".")).join(", ")}</div>
        <input ref={input} type="file" accept={accept.join(",")} multiple={multiple} onChange={(e) => pick((e.target as HTMLInputElement).files)} data-testid="file-input" />
      </div>
      {files.length > 0 && (
        <ul class="ff-files" aria-live="polite">
          {files.map((f) => <li key={f.name + f.size}>{f.name}</li>)}
          <li><button type="button" class="ff-btn ff-btn--ghost" onClick={() => onFiles([])}>{t(locale, "common.clear")}</button></li>
        </ul>
      )}
    </div>
  );
}
