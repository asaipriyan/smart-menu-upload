import { useEffect, useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per file
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Img = {
  id: string;
  file: File;
  preview: string;
  error?: string;
};

function formatSize(bytes: number) {
  const u = ["B", "KB", "MB", "GB"];
  let i = 0,
    n = bytes;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 2)} ${u[i]}`;
}

export default function App() {
  const [imgs, setImgs] = useState<Img[]>([]);
  const [results, setResults] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).map((file) => {
      let error: string | undefined;
      if (!ACCEPTED.includes(file.type)) error = "Only JPG/PNG/WEBP allowed";
      else if (file.size > MAX_BYTES) error = "Max 5 MB per file";

      return {
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        error,
      };
    });
    setImgs((prev) => [...prev, ...arr]);
  };

  // revoke object URLs when items change/unmount
  useEffect(() => {
    return () => imgs.forEach((i) => URL.revokeObjectURL(i.preview));
  }, [imgs]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onPick = () => inputRef.current?.click();
  const remove = (id: string) =>
    setImgs((prev) => prev.filter((i) => i.id !== id));

  const uploadAll = async () => {
    const fd = new FormData();
    imgs
      .filter((i) => !i.error)
      .forEach((img) => {
        fd.append("menu", img.file);
      });
    const response = await fetch(
      "http://localhost:4000/api/8051046/menu/upload",
      {
        method: "POST",
        body: fd,
      }
    );

    if (response.ok) {
      const data = await response.json();
      setResults(data);
    } else {
      alert("Upload failed!");
    }
  };

  return (
    <div className="container">
      <h1>Image Upload + Preview</h1>
      <p>Drag & drop or choose files. We’ll validate type and size.</p>

      <div
        className="dropzone"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={onPick}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          hidden
        />
        <span>Drop images here or click to select</span>
      </div>

      {imgs.length > 0 && (
        <>
          <div className="grid">
            {imgs.map((img) => (
              <figure
                key={img.id}
                className={`thumb ${img.error ? "thumb-error" : ""}`}
              >
                <img src={img.preview} alt={img.file.name} />
                <figcaption>
                  <div className="row">
                    <strong title={img.file.name}>{img.file.name}</strong>
                    <button onClick={() => remove(img.id)} aria-label="Remove">
                      ✕
                    </button>
                  </div>
                  <small>
                    {formatSize(img.file.size)} • {img.file.type}
                  </small>
                  {img.error && <div className="error">{img.error}</div>}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="actions">
            <button onClick={uploadAll}>Upload</button>
            <button onClick={() => setImgs([])} className="secondary">
              Clear
            </button>
          </div>
        </>
      )}

      {results && (
        <div className="results">
          <h2>Upload Results</h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(results, null, 2));
            }}
            style={{ marginBottom: "8px" }}
          >
            Copy
          </button>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
