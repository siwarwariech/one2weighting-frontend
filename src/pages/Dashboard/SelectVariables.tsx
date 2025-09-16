import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/services/api";
import { getColumns, ColumnMeta } from "@/services/columns";
import Stepper from "@/components/Stepper";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";

const MAX_VARS = 3;

export default function SelectVariables() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cols, setCols] = useState<ColumnMeta[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await getColumns(+id);
      setCols(data);
      setLoading(false);
    })();
  }, [id]);

  const toggle = (name: string, blocked: boolean) => {
    if (blocked) return;
    setChecked(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : prev.length < MAX_VARS
          ? [...prev, name]
          : prev
    );
  };

  const canNext = checked.length >= 1 && checked.length <= MAX_VARS;

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center mb-4">
        <Link 
          to={`/dashboard/project/${id}/upload`}
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Data Upload
        </Link>
      </div>
      <Stepper current={2} />

      <h2 className="text-3xl font-semibold text-gray-800">
        Select variables to be weighted
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Select up to {MAX_VARS} variables for weighting. Variables with blank values cannot be selected.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <span className="text-xs text-gray-500">Select</span>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 min-w-[180px]">
                    Variable Label
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 min-w-[150px]">
                    Description
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 min-w-[200px]">
                    Example Data
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {cols.map((col, index) => {
                  const blocked = col.hasBlank;
                  const selected = checked.includes(col.name);
                  const isEven = index % 2 === 0;

                  return (
                    <tr
                      key={col.name}
                      className={clsx(
                        "transition-colors duration-150",
                        isEven ? "bg-white" : "bg-gray-50",
                        blocked && "opacity-70 cursor-not-allowed",
                        selected && "bg-blue-50 border-l-2 border-l-blue-600"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            disabled={blocked}
                            checked={selected}
                            onChange={() => toggle(col.name, blocked)}
                            className={clsx(
                              "h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                              blocked 
                                ? "cursor-not-allowed opacity-50" 
                                : "cursor-pointer hover:border-blue-400"
                            )}
                          />
                        </div>
                      </td>

                      {/* Variable Label */}
                      <td className="p-4">
                        <div className="font-medium text-gray-900 text-sm">
                          {col.name}
                        </div>
                        {blocked && (
                          <div className="text-xs text-red-500 mt-1">
                            Cannot select
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="p-4">
                        <div className={clsx(
                          "text-sm whitespace-pre-line",
                          blocked ? "text-red-500 font-medium" : "text-gray-600"
                        )}>
                          {blocked ? (
                            <div className="text-green-600 font-medium">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              Contains blank values
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center">
                                {col.unique} unique values
                              </div>
                              
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Example Data */}
                      <td className="p-4">
                        <div className={clsx(
                          "text-sm max-w-[300px] truncate",
                          blocked ? "text-red-400" : "text-gray-700"
                        )}>
                          {col.sample || "—"}
                        </div>
                        {!blocked && col.sample && (
                          <div className="text-xs text-gray-400 mt-1">
                            First 5 unique values
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800">
              Selected: <span className="font-semibold">{checked.length}</span> of {MAX_VARS} variables
            </p>
            {checked.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Selected: {checked.join(", ")}
              </p>
            )}
          </div>
          
          <button
            disabled={!canNext}
            onClick={() =>
              navigate(`/dashboard/project/${id}/targets`, {
                state: { vars: checked },
              })
            }
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200",
              canNext
                ? "btn-primary flex items-center gap-2"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            Continue to Targets
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Instructions */}
      
    </div>
  );
}