import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "@/services/api";
import Stepper from "@/components/Stepper";
import { ArrowRight, Download, Loader2, FileBarChart2 } from "lucide-react"; // ➕ icon
import clsx from "clsx";
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Weighting() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { vars, targets } = useLocation().state || {};

  const filledVars = (vars as string[]).filter(v => targets?.[v]?.pctCol);

  const [method, setMethod] = useState<"post"|"rake"|null>(null);
  const [running, setRunning] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  


  const runWeighting = async () => {
    if (!id || !method) return;

    if (method === "post" && filledVars.length !== 1) {
      alert("La post-stratification nécessite exactement UNE variable avec une table de référence.");
      return;
    }
    if (method === "rake" && (filledVars.length < 2 || filledVars.length > 3)) {
      alert("Le raking nécessite 2-3 variables, chacune avec une table de référence.");
      return;
    }

    setRunning(true);
    setPreview([]);
    setError(null);
    setFileUrl("");

    try {
      const payload = {
        method,
        vars: filledVars,
        targets: Object.fromEntries(
          filledVars.map(v => [
            v,
            {
              pctCol: targets[v].pctCol,
              mapping: targets[v].mapping
            }
          ])
        )
      };

      const { data } = await api.post(`/api/projects/${id}/run-weighting`, payload);
      setPreview(data.preview);
      setFileUrl(data.download_url);
    } catch (e: any) {
      console.error("Erreur détaillée:", e.response?.data);
      
      let errorMessage = "Une erreur est survenue lors du calcul des poids. Vérifiez vos données.";
      
      if (e.response?.status === 400) {
        errorMessage = e.response.data?.detail || "Invalid data format. Please check your input.";
      } else if (e.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (e.response?.status === 403) {
        errorMessage = "You don't have permission to run weighting.";
      } else if (e.response?.status === 422) {
        errorMessage = e.response.data?.detail || "Validation error. Please check your data.";
      } else if (e.response?.data?.detail) {
        errorMessage = e.response.data.detail;
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/api/projects/${id}/download-weighted`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weighted_data_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const done = !!fileUrl;
  const ready = !!method && !running;

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center mb-4">
              <Link 
                to={`/dashboard/project/${id}/variables`}
                className="flex items-center text-blue-600 hover:underline"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Variable Selection
              </Link>
            </div>
      <Stepper current={4} />
      <h2 className="text-2xl font-semibold">Choose a weighting method</h2>
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
        />
      )}

      <div className="space-x-4 mt-4">
        <label className="cursor-pointer">
          <input
            type="radio"
            disabled={filledVars.length !== 1}
            checked={method === "post"}
            onChange={() => setMethod("post")}
          />{" "}
          Post-stratification (1 variable)
        </label>

        <label className="cursor-pointer">
          <input
            type="radio"
            disabled={filledVars.length < 2 || filledVars.length > 3}
            checked={method === "rake"}
            onChange={() => setMethod("rake")}
          />{" "}
          Raking /IPF (2-3 variables)
        </label>
      </div>

      {!done && (
        <div className="pt-8">
          <button
            disabled={!ready}
            onClick={runWeighting}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded shadow",
              ready
                ? "btn-primary flex items-center gap-2"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            {running && <Loader2 className="animate-spin" size={18} />}
            Weight <ArrowRight size={18} />
          </button>
        </div>
      )}

      {done && (
        <>
          <h3 className="text-lg font-medium mt-8">Preview (first 5 rows)</h3>

          {preview.length > 0 && (
            <div className="overflow-x-auto border mt-2">
              <table className="text-xs w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).map((h) => (
                      <th key={h} className="px-2 py-1 text-left border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-2 py-1 border">
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* actions after success */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2"
            >
              <Download size={16} /> Download XLSX
            </button>

            {/* ➕ tiny “Get rapport” button */}
            <button
              onClick={() => nav(`/dashboard/project/${id}/rapport-weighted`)} // ← change if your route differs
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded border border-indigo-600 text-indigo-700 hover:bg-indigo-50"
              title="Voir le rapport pondéré"
            >
              <FileBarChart2 size={16} />
              Get rapport
            </button>
          </div>

          <div className="pt-6">{/* spacer */}</div>
        </>
      )}
    </div>
  );
}