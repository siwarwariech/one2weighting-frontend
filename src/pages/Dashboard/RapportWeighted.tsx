import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import Stepper from "@/components/Stepper";
import clsx from "clsx";
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid
} from "recharts";
import toast from "react-hot-toast";

/* ========= Types ========= */
type Column = { name: string; type: string };
type DistRow = { label: string; count?: number; pct: number; pop_pct?: number };

type NumericRow = { label: string; count: number; pct: number; pop_pct?: number };

type WeightedStats = {
  weights: { n_rows: number; sum_w: number; n_eff: number; w_min: number; w_max: number };
  numeric: {
    col: string;
    count: number;
    mean: number | null;
    std: number | null;
    min: number | null;
    p25: number | null;
    p50: number | null;
    p75: number | null;
    max: number | null;
    hist: { edges: number[]; counts: number[]; rows?: NumericRow[] };
  }[];
};

// New type for target data
type TargetData = {
  [variable: string]: Array<[string, number]>; // [modality, officialPercentage]
};

const fmt = (n?: number | null, digits = 2) =>
  n == null ? "—" : n.toLocaleString("fr-FR", { maximumFractionDigits: digits });

/* ========= UI bits ========= */
const Card: React.FC<
  React.PropsWithChildren<{ className?: string; title?: string; subtitle?: string }>
> = ({ className, title, subtitle, children }) => (
  <div
    className={clsx(
      "rounded-xl border border-emerald-100 bg-white/80 shadow-sm backdrop-blur",
      "hover:shadow-md transition-shadow",
      className
    )}
  >
    {(title || subtitle) && (
      <div className="px-4 py-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-transparent rounded-t-xl">
        {title && <div className="text-emerald-900 font-semibold">{title}</div>}
        {subtitle && <div className="text-xs text-emerald-700/70 mt-0.5">{subtitle}</div>}
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const DistributionTable: React.FC<{ rows: DistRow[]; title?: string }> = ({ rows, title }) => (
  <div className="overflow-x-auto">
    {title && <h3 className="text-lg font-semibold text-emerald-900 mb-3">{title}</h3>}
    <table className="w-full border border-emerald-200 text-sm rounded-lg">
      <thead className="bg-emerald-50 text-emerald-800">
        <tr>
          <th className="px-3 py-2 text-left">Modalité</th>
          <th className="px-3 py-2 text-right">N pondéré</th>
          <th className="px-3 py-2 text-right">% enquête</th>
          <th className="px-3 py-2">Progression</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r: DistRow, i: number) => {
          const pct = Math.max(0, Math.min(100, r.pct ?? 0));
          return (
            <tr key={r.label} className={i % 2 ? "bg-white" : "bg-emerald-50/30"}>
              <td className="px-3 py-2 border-t border-emerald-200">{r.label}</td>
              <td className="px-3 py-2 border-t border-emerald-200 text-right">
                {r.count != null ? fmt(r.count, 0) : "—"}
              </td>
              <td className="px-3 py-2 border-t border-emerald-200 text-right">{fmt(pct, 2)} %</td>
              <td className="px-3 py-2 border-t border-emerald-200">
                <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// New component for target table
const TargetTable: React.FC<{ 
  rows: Array<{ modality: string; officialPct: number }>; 
  title: string;
}> = ({ rows, title }) => (
  <div className="overflow-x-auto">
    <h3 className="text-lg font-semibold text-blue-900 mb-3">{title}</h3>
    <table className="w-full border border-blue-200 text-sm rounded-lg">
      <thead className="bg-blue-50 text-blue-800">
        <tr>
          <th className="px-3 py-2 text-left">Modalité</th>
          <th className="px-3 py-2 text-right">% Officiel</th>
          <th className="px-3 py-2">Progression</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i: number) => {
          const pct = r.officialPct;
          return (
            <tr key={r.modality} className={i % 2 ? "bg-white" : "bg-blue-50/30"}>
              <td className="px-3 py-2 border-t border-blue-200">{r.modality}</td>
              <td className="px-3 py-2 border-t border-blue-200 text-right">
                {fmt(r.officialPct, 2)} %
              </td>
              <td className="px-3 py-2 border-t border-blue-200">
                <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

/* ========= Page ========= */
export default function RapportWeighted() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [targetData, setTargetData] = useState<TargetData>({});
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [stats, setStats] = useState<WeightedStats | null>(null);
  const [allStats, setAllStats] = useState<{[key: string]: WeightedStats}>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [targetLoading, setTargetLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  // Get comparison data for a variable
  const getComparisonRowsForVariable = (variable: string) => {
  const weightedRows = getWeightedRowsForVariable(variable);
  const targetRows = targetData[variable] || [];
  
  // Create a map for quick lookup
  const targetMap = new Map(targetRows.map(([modality, pct]) => [modality, pct]));
  
  return weightedRows.map(weightedRow => {
    const officialPct = targetMap.get(weightedRow.label) || null;
    const difference = officialPct !== null 
      ? weightedRow.pct - officialPct 
      : null;
    
    return {
      modality: weightedRow.label,
      weightedPct: weightedRow.pct,
      officialPct,
      difference
    };
  });
};

  // Fetch columns and target data
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {

        
        // Fetch columns
        const res = await api.get(`/api/projects/${id}/columns`);
        const cols: Column[] = (res.data ?? []).map((c: any): Column => ({
          name: String(c.name),
          type: String(c.type),
        }));
        setColumns(cols);
        if (cols[0]) setSelectedCol(cols[0].name);

         // DEBUG: Vérifiez ce que retourne l'API target-data
         const targetRes = await api.get(`/api/projects/${id}/target-data`);
         console.log("Target data response:", targetRes.data);
         setTargetData(targetRes.data);
    
        // DEBUG: Vérifiez le contenu du dossier uploads
        const uploadsCheck = await api.get(`/api/projects/${id}/check-uploads`);
        console.log("Uploads check:", uploadsCheck.data);
        
        // Fetch weighted stats for all target variables
       
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTargetLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
  setSelectedVariables(Object.keys(targetData));
}, [targetData]);


  // Fetch stats for the selected column
  const fetchStats = async () => {
    if (!id || !selectedCol) return;
    try {
      setLoading(true);
      setErr(null);
      const url = `/api/projects/${id}/weighted-stats?numeric_cols=${encodeURIComponent(selectedCol)}`;
      const { data } = await api.get<WeightedStats>(url);
      setStats(data);
      setAllStats(prev => ({...prev, [selectedCol]: data}));
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Impossible de charger les statistiques pondérées");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedCol]);

  // Use first numeric result for selected column
  const numeric = useMemo(() => (stats?.numeric?.length ? stats.numeric[0] : null), [stats]);

  const rows = useMemo<DistRow[]>(() => {
    if (!numeric) return [];
    const raw: DistRow[] =
      ((numeric as any).rows as DistRow[] | undefined) ??
      ((numeric.hist?.rows as DistRow[] | undefined) ?? []);

    if (!raw.length) return [];

    const allLeOne = raw.every(r => typeof r.pct === "number" && r.pct <= 1);
    const factor = allLeOne ? 100 : 1;

    return raw.map(r => ({
      ...r,
      pct: (r.pct ?? 0) * factor,
    }));
  }, [numeric]);

  // Get target data for selected column
  const targetRows = useMemo(() => {
    if (!selectedCol || !targetData[selectedCol]) return [];
    
    return targetData[selectedCol].map(([modality, officialPct]) => ({
      modality,
      officialPct
    }));
  }, [selectedCol, targetData]);

  // Get weighted rows for any variable
  const getWeightedRowsForVariable = (variable: string): DistRow[] => {
    const variableStats = allStats[variable];
    if (!variableStats || !variableStats.numeric?.length) return [];
    
    const numericData = variableStats.numeric[0];
    const raw: DistRow[] =
      ((numericData as any).rows as DistRow[] | undefined) ??
      ((numericData.hist?.rows as DistRow[] | undefined) ?? []);

    if (!raw.length) return [];

    const allLeOne = raw.every(r => typeof r.pct === "number" && r.pct <= 1);
    const factor = allLeOne ? 100 : 1;

    return raw.map(r => ({
      ...r,
      pct: (r.pct ?? 0) * factor,
    }));
  };

  // Pie chart colors
  const COLORS = [
    "#10b981","#34d399","#059669","#6ee7b7","#047857",
    "#a7f3d0","#065f46","#86efac","#22c55e","#16a34a",
    "#4ade80","#15803d","#bbf7d0"
  ];

  const pieData = rows
    .filter((r: DistRow) => r.pct > 0)
    .map((r: DistRow) => ({ name: r.label, value: Number(r.pct) }));

  // Toggle variable selection
  const toggleVariableSelection = (variable: string) => {
    if (selectedVariables.includes(variable)) {
      setSelectedVariables(selectedVariables.filter(v => v !== variable));
    } else {
      setSelectedVariables([...selectedVariables, variable]);
      
      // Fetch stats for this variable if not already loaded
      if (!allStats[variable]) {
        api.get(`/api/projects/${id}/weighted-stats?numeric_cols=${encodeURIComponent(variable)}`)
          .then(response => {
            setAllStats(prev => ({...prev, [variable]: response.data}));
          })
          .catch(error => {
            console.error(`Error fetching stats for ${variable}:`, error);
          });
      }
    }
  };

  return (
    <div className="space-y-6 mb-12">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-50" />
      <Stepper current={5} />
      <div className="flex items-center justify-between">
  
  
  
</div>

      {/* Header */}
      <div className="flex items-center justify-between">
      
        <div>
          <h2 className="text-3xl font-bold text-emerald-900">Rapport pondéré</h2>
        </div>
        
      </div>

      {/* Controls */}
      <Card title="">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm font-medium text-emerald-900 mb-1">Variable</div>
            <select
              className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200 rounded-lg px-3 py-2 w-72"
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
            >
              {columns.map((c: Column) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={fetchStats}
              className="btn-primary flex items-center gap-2"
            >
              Recalculer
            </button>
          </div>
        </div>
      </Card>

      {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">{err}</div>}

      {targetLoading && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          Chargement des données cibles...
        </div>
      )}

      {!loading && stats && !numeric && (
        <div className="p-3 text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg">
          Pas de données pour cette variable.
        </div>
      )}

      {/* ... le code existant ... */}

{/* Variable Selection */}
<Card title="Sélection des variables pour comparaison">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
    {Object.keys(targetData).map(variable => (
      <label key={variable} className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={selectedVariables.includes(variable)}
          onChange={() => toggleVariableSelection(variable)}
          className="rounded text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm">{variable}</span>
      </label>
    ))}
  </div>
  
  {/* Message d'information */}
  {Object.keys(targetData).length === 0 && !targetLoading && (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800">
        Aucune donnée cible trouvée. Veuillez uploader les fichiers cibles dans l'étape "Targets" d'abord.
      </p>
    </div>
  )}
</Card>

{/* Message si aucune variable n'est sélectionnée mais il y a des données cibles */}
{Object.keys(targetData).length > 0 && selectedVariables.length === 0 && (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-800">
      Veuillez sélectionner au moins une variable ci-dessus pour afficher les comparaisons.
    </p>
  </div>
)}



{/* Comparison Tables for selected variables */}
{selectedVariables.map(variable => (
  targetData[variable] && targetData[variable].length > 0 && (
    <Card key={variable} title={`Comparaison - ${variable}`} className="mb-6">
      {/* Weighted Results for this variable */}
      {allStats[variable] && allStats[variable].numeric?.length > 0 && (
        <DistributionTable 
          rows={getWeightedRowsForVariable(variable)} 
          title="Résultats Pondérés"
        />
      )}
      
      {/* Target Values - Utilisation des pourcentages officiels exacts */}
      <TargetTable 
        rows={targetData[variable].map(([modality, officialPct]) => ({
          modality,
          officialPct
        }))}
        title="Cibles Officielles"
      />
      
      
    </Card>
  )
))}



      {/* Individual Tables for variables without targets */}
      {numeric && targetRows.length === 0 && (
        <Card title={`Répartition pondérée — ${numeric.col}`}>
          <DistributionTable rows={rows} />
        </Card>
      )}

      {/* Pie chart for selected variable */}
      {numeric && (
        <Card title="Camembert des modalités (pondéré)" subtitle="Parts en pourcentage (somme = 100 %).">
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip formatter={(v: any) => [`${fmt(Number(v), 2)} %`, "% enquête (pondéré)"]} />
                <Legend />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  labelLine={false}
                  label={(d: any) => `${fmt(d.value, 1)} %`}
                >
                  {pieData.map((_: { name: string; value: number }, idx: number) => (
                    <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}