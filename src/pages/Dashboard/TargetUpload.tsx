// ──────────────────────────────────────────────────────────────
// src/pages/Dashboard/TargetUpload.tsx
// ──────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "@/services/api";
import Stepper from "@/components/Stepper";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import FormData from "form-data"; // pas nécessaire si tu es en navigateur


/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const canonical = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // accents
    .replace(/[^a-z0-9]+/g, " ");     // tirets, etc.

const loadSheet = async (f: File) => {
  const buf = await f.arrayBuffer();

  if (f.name.endsWith(".csv")) {
    const txt = new TextDecoder().decode(buf);
    const { data } = Papa.parse<string[]>(txt);
    const [header, ...rows] = data as string[][];
    return { header, rows };
  }

  const wb   = XLSX.read(buf, { type: "array" });
  const rows = XLSX.utils.sheet_to_json<string[]>(
    wb.Sheets[wb.SheetNames[0]],
    { header: 1 }
  );
  const [header, ...body] = rows as string[][];
  return { header, rows: body };
};

/* ------------------------------------------------------------------ */
/* Types local                                                        */
/* ------------------------------------------------------------------ */
type RowMap = [
  string,            // modalité enquête
  number,            // % enquête
  string | null,     // libellé officiel (ou null si non trouvé)
  number | null,     // % officiel (direct from file)
  number | null      // écart
];

interface Card {
  file   : File | null;
  header : string[];
  catCol : string;
  pctCol : string;
  mapping: RowMap[];
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function TargetUpload() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const vars: string[] = useLocation().state?.vars || [];

  const uploadTargetFile = async (projId: string, varName: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  await api.post(`/api/projects/${projId}/upload-target/${encodeURIComponent(varName)}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
  

  /* -------------------------------------------------------------- */
  /* 1)  % enquête fournis par le backend                           */
  /* -------------------------------------------------------------- */
  const [surveyDist, setSurveyDist] =
    useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (!id) return;
    api.get(`/api/projects/${id}/survey-dist`).then((r) => setSurveyDist(r.data));
  }, [id]);

  /* -------------------------------------------------------------- */
  /* 2)  state carte/variable                                       */
  /* -------------------------------------------------------------- */
  const [cards, setCards] = useState<Record<string, Card>>(
    Object.fromEntries(
      vars.map((v) => [
        v,
        { file: null, header: [], catCol: "", pctCol: "", mapping: [] },
      ])
    ) as Record<string, Card>
  );
  const setCard = (v: string, patch: Partial<Card>) =>
    setCards((p) => ({ ...p, [v]: { ...p[v], ...patch } }));

  /* -------------------------------------------------------------- */
  /* 3)  build mapping dès que file + catCol + pctCol sont prêts    */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!vars.length) return;
    /* boucle asynchrone sur chaque variable sélectionnée */
    (async () => {
      for (const v of vars) {
        const c = cards[v];
        if (!c.file || !c.catCol || !c.pctCol) continue;
        if (!surveyDist[v]) continue;                 // dist pas encore chargée

        const { header, rows } = await loadSheet(c.file);
        const iCat = header.indexOf(c.catCol);
        const iPct = header.indexOf(c.pctCol);
        if (iCat === -1 || iPct === -1) continue;

        /* ---------- dictionnaire % OFFICIEL ---------- */
        const dict: Record<string, { label: string; pct: number }> = {};

        rows.forEach((r) => {
          const rawLabel = String(r[iCat] ?? "");
          const key      = canonical(rawLabel);

          // Get the raw percentage value as string
          let rawPct = String(r[iPct] ?? "").trim();
          
          // Convert to number (handle comma as decimal separator)
          const val = parseFloat(rawPct.replace(",", ".").replace("%", ""));
          
          if (!Number.isFinite(val)) return; // skip invalid numbers

          // Store the original label and the percentage value as-is
          dict[key] = { label: rawLabel, pct: val };
        });

        /* ---------- mapping final ---------- */
        const mapping: RowMap[] = Object.entries(surveyDist[v]).map(([modEnq, enqPct]) => {
          const official = dict[canonical(modEnq)];
          
          // Use the official percentage as-is (no normalization)
          const offPct = official?.pct ?? null;

          // Calculate difference (survey % - official %)
          const diff = offPct !== null 
            ? +(enqPct - offPct).toFixed(4) 
            : null;

          return [
            modEnq,
            +enqPct.toFixed(4),         // % enquête
            official?.label ?? null,     // Libellé original
            offPct,                      // % officiel (direct from file)
            diff                         // Écart
          ];
        });

        setCard(v, { mapping });
      }
    })();
  }, [cards, surveyDist, vars]);

  /* -------------------------------------------------------------- */
  /* Helper function to determine ecart color                       */
  /* -------------------------------------------------------------- */
  const getEcartColor = (diff: number | null) => {
    if (diff === null) return "text-gray-400";
    
    // Only show red if difference is greater than ±5%
    if (Math.abs(diff) > 5) {
      return "text-green-600 font-medium";
    }
    
    return "text-gray-600";
  };

  

  
  /* -------------------------------------------------------------- */
  /* 4)  render                                                     */
  /* -------------------------------------------------------------- */
  const ready = vars.every((v) => cards[v].mapping.length > 0);

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
      
      <Stepper current={3} />
      <h2 className="text-2xl font-semibold">Set&nbsp;Targets</h2>

      {/* Info box about ecart coloring */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Les écarts supérieurs à ±5% sont affichés en <span className="text-green-600 font-medium">green</span>.
        </p>
      </div>

      {/* ---------- cartes ---------- */}
      {vars.map((v) => {
        const c = cards[v];
        return (
          <div key={v} className="border p-4 rounded space-y-3">
            <h3 className="font-medium text-lg">{v}</h3>

            {/* ① Browse */}
            <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded inline-block">
              Browse&nbsp;file
              <input
                hidden
                type="file"
                accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const { header } = await loadSheet(f);
                  setCard(v, { file: f, header });
                }}
              />
            </label>
            {c.file && (
              <span className="ml-2 text-sm text-gray-600">{c.file.name}</span>
            )}

            {/* ② Select columns */}
            {c.header.length > 0 && (
              <div className="flex gap-4 flex-wrap">
                {["catCol", "pctCol"].map((key) => (
                  <div key={key} className="mt-2">
                    <label className="text-sm mr-1">
                      {key === "catCol" ? "Category column:" : "Percent column:"}
                    </label>
                    <select
                      value={c[key as "catCol" | "pctCol"]}
                      onChange={(e) => setCard(v, { [key]: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">— choose —</option>
                      {c.header.map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* ③ Mapping */}
            {c.mapping.length > 0 && (
              <table className="mt-3 border w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left">Modalité&nbsp;(enq.)</th>
                    <th className="p-2 text-left">%&nbsp;enq.</th>
                    <th className="p-2 text-left">Modalité&nbsp;(off.)</th>
                    <th className="p-2 text-left">%&nbsp;off.</th>
                    <th className="p-2 text-left">Écart</th>
                  </tr>
                </thead>
                <tbody>
                  {c.mapping.map(([modEnq, pctEnq, modOff, pctOff, diff]) => (
                    <tr key={modEnq}>
                      <td className="p-2">{modEnq}</td>
                      <td className="p-2">{pctEnq.toLocaleString("fr-FR")} %</td>
                      <td className="p-2">{modOff ?? "—"}</td>
                      <td className="p-2">
                        {pctOff == null
                          ? "—"
                          : pctOff.toLocaleString("fr-FR") + " %"}
                      </td>
                      <td
                        className={clsx(
                          "p-2 font-medium",
                          getEcartColor(diff)
                        )}
                      >
                        {diff == null ? "—" : diff.toLocaleString("fr-FR") + " %"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

     <button
  disabled={!ready}
  onClick={async () => {
    const formData = new FormData();

    // Ajouter tous les fichiers dans UN FormData
    for (const v of vars) {
      const c = cards[v];
      if (c.file) {
        formData.append("files", c.file); // "files" pour multiple fichiers
      }
    }

    try {
      // 1. Upload groupé - UNE seule requête avec tous les fichiers
      const res = await api.post(`/api/projects/${id}/upload-targets`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Réponse du backend:", res.data);

      // 2. Lire la réponse backend
      const { redirect_to } = res.data;

      // 3. Navigation vers weighting avec state
      navigate(`/dashboard/project/${id}/${redirect_to}`, {
        state: {
          vars,
          targets: Object.fromEntries(
            vars.map((v) => [
              v,
              {
                catCol: cards[v].catCol,
                pctCol: cards[v].pctCol,
                mapping: cards[v].mapping,
              },
            ])
          ),
        },
      });
    } catch (err) {
      console.error("❌ Upload failed", err);
      alert("Upload failed. Please try again.");
    }
  }}
  className={clsx(
    "flex items-center gap-2 px-6 py-2 rounded shadow",
    ready
      ? "btn-primary flex items-center gap-2"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  )}
>
  next <ArrowRight size={18} />
</button>

    </div>
  );
}