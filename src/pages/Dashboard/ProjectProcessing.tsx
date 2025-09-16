// src/pages/Dashboard/ProjectProcessing.tsx   (phase 1 only)
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Project } from "@/types/project";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Loader2, UploadCloud, Check, ArrowRight } from "lucide-react";
import Stepper from "@/components/Stepper";
import { isAxiosError } from 'axios';
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft } from "lucide-react";


/* ------- types ------- */
type UploadState = "idle" | "selected" | "uploading" | "done";

function SurveyWidget({
  onDone,
  onPreview,
}: {
  onDone: () => void;
  onPreview: (rows: string[][]) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const [fileName, setFileName] = useState<string>("");
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string>("");
  

  const processFile = async (f: File) => {
    /* ---- preview local ---- */
    try {
      const buf = await f.arrayBuffer();
      let rows: string[][] = [];
      
      if (f.name.endsWith(".csv")) {
        const txt = new TextDecoder().decode(buf);
        rows = Papa.parse<string[]>(txt, { preview: 5 }).data as string[][];
      } else {
        const wb = XLSX.read(buf, { type: "array" });
        rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
          header: 1,
        }) as string[][];
        rows = rows.slice(0, 5);
      }
      onPreview(rows);

      /* ---- upload ---- */
      if (!id) return;
      setState("uploading");
      setError("");
      
      const fd = new FormData();
      fd.append("file", f); // Keep consistent with backend
      
      const response = await api.post(`/api/projects/${id}/upload-survey`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data.ok) {
        setState("done");
        onDone();
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
   } catch (err) {
      console.error("Upload error:", err);
      setState("idle");
      
      let errorMessage = "Upload failed";
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail;
        
        if (status === 413) {
          errorMessage = "File too large. Maximum size is 10MB.";
        } else if (status === 415) {
          errorMessage = "Unsupported file format. Please use CSV or Excel files.";
        } else if (status === 400 && detail) {
          errorMessage = detail;
        } else if (status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (status === 403) {
          errorMessage = "You don't have permission to upload files.";
        } else {
          errorMessage = detail || err.message || "Upload failed";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Validate file size (e.g., 10MB max)
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    
    setFileName(f.name);
    processFile(f);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label
          htmlFor="survey-file"
          className="cursor-pointer rounded bg-blue-500 text-white px-4 py-2 inline-block hover:bg-blue-600"
        >
          Browse survey
        </label>
        <input
          id="survey-file"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleSelect}
          className="hidden"
        />
        <span className="text-sm text-gray-600 w-56 truncate">
          {fileName || "No file selected"}
        </span>
        {state === "uploading" && <Loader2 className="animate-spin" />}
        {state === "done" && <Check className="text-green-600" />}
      </div>
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError("")}
          className="mt-2"
        />
      )}
    </div>
  );
}

/* ------- render table helper ------- */
const renderTable = (rows: string[][]) => {
  if (!rows.length) return null;
  const [head, ...body] = rows;
  return (
    <div className="max-w-full overflow-x-auto mt-4 border rounded-lg">
      <table className="min-w-[600px] text-xs border-collapse">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-3 py-1 font-semibold border">
                {h || "—"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri} className={ri % 2 ? "bg-gray-50" : ""}>
              {r.map((c, ci) => (
                <td key={ci} className="px-3 py-1 border whitespace-nowrap">
                  {c || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ------- main page ------- */
export default function ProjectProcessing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [surveyOK, setSurveyOK] = useState(false);
  const [preview, setPreview] = useState<string[][]>([]);

  useEffect(() => {
    if (id) api.get<Project>(`/api/projects/${id}`).then((r) => setProject(r.data));
  }, [id]);

  if (!project) return <div className="mt-10 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
       {/* step header */}
      <Stepper current={1} />
      

      <div className="card space-y-6 max-w-3xl">
        
        <h2 className="text-3xl font-bold">{project.name}</h2>

        <SurveyWidget
          onDone={() => setSurveyOK(true)}
          onPreview={setPreview}
        />

        {renderTable(preview)}

        {surveyOK && (
  <div className="text-right mt-4">
    <button
      onClick={() => navigate(`/dashboard/project/${id}/variables`)}
      className="btn-primary flex items-center gap-2"
    >
      Start weighting
      <ArrowRight size={18} />
    </button>
  </div>
)}

      </div>
    </div>
  );
}