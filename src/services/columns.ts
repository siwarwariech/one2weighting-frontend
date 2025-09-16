import api from "./api";

/* what the backend returns for each column */
export interface ColumnMeta {
  name: string;        // column header
  hasBlank: boolean;   // true ⇢ grey & disabled
  sample: string;      // comma-separated unique values
  blank_ratio: number; // 0 – 1 fraction of blanks/NaNs
  unique: number;      // number of unique values
}

/* GET /api/projects/:id/columns */
export async function getColumns(projectId: number) {
  const { data } = await api.get<ColumnMeta[]>(
    `/api/projects/${projectId}/columns`
  );
  return data;
}
