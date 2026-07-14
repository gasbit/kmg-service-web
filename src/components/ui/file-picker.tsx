"use client";

import { useRef, useState, type DragEvent } from "react";
import { CloseIcon, ImageIcon, UploadIcon } from "@/components/icon/icons";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

type FilePickerProps = {
  accept?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  file: File | null;
  id: string;
  label: string;
  onFileChange: (file: File | null) => void;
  previewAlt?: string;
  previewUrl?: string | null;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("th-TH")} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("th-TH", { maximumFractionDigits: 1 })} MB`;
}

export function FilePicker({ accept, description, disabled, error, file, id, label, onFileChange, previewAlt = "ตัวอย่างไฟล์ที่เลือก", previewUrl }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function chooseFile(nextFile?: File) {
    if (nextFile) onFileChange(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) chooseFile(event.dataTransfer.files[0]);
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={id}>{label}</label>
      <input
        accept={accept}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className="sr-only"
        disabled={disabled}
        id={id}
        onChange={(event) => chooseFile(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />
      <div
        className={cn(
          "grid min-h-52 overflow-hidden rounded-2xl border border-dashed bg-slate-50 transition sm:grid-cols-[13rem_1fr]",
          dragging ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-300",
          error && "border-red-400 bg-red-50/40",
          disabled && "opacity-60",
        )}
        onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="grid min-h-48 place-items-center border-b border-slate-200 bg-white p-4 sm:min-h-full sm:border-b-0 sm:border-r">
          {previewUrl ? (
            <span aria-label={previewAlt} className="block size-40 rounded-2xl bg-contain bg-center bg-no-repeat" role="img" style={{ backgroundImage: `url(${JSON.stringify(previewUrl)})` }} />
          ) : (
            <span className="grid size-20 place-items-center rounded-2xl bg-blue-50 text-blue-500"><ImageIcon className="size-9" /></span>
          )}
        </div>
        <div className="flex flex-col justify-center p-5 sm:p-6">
          <p className="font-bold text-[#071a43]">{file ? file.name : "เลือกรูปสินค้า"}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{file ? `${formatFileSize(file.size)} · พร้อมอัปโหลดเมื่อบันทึกสินค้า` : description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={disabled} leftIcon={<UploadIcon className="size-4" />} onClick={() => inputRef.current?.click()} size="sm" variant="secondary">
              {file ? "เปลี่ยนรูป" : "เลือกไฟล์"}
            </Button>
            {file ? <Button disabled={disabled} leftIcon={<CloseIcon className="size-4" />} onClick={() => { if (inputRef.current) inputRef.current.value = ""; onFileChange(null); }} size="sm" variant="ghost">เอารูปออก</Button> : null}
          </div>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-red-600" id={`${id}-error`} role="alert">{error}</p> : null}
    </div>
  );
}
