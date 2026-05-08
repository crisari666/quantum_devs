import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { TableSkeleton } from '../../components/TableSkeleton';
import { ApiError, apiJson } from '../../lib/api';
import { useAppSelector } from '../../store/hooks';

type Technology = { _id: string; name: string; iconKey: string; category: string };

type ProjectRow = {
  _id: string;
  title: string;
  description: string;
  url: string;
  images: string[];
  githubUrl: string | null;
  featured: boolean;
  technologies: Technology[];
};

type PaginatedProjects = {
  items: ProjectRow[];
  total: number;
  page: number;
  limit: number;
};

export function ProjectsPage() {
  const token = useAppSelector((s) => s.auth.token);
  const [data, setData] = useState<PaginatedProjects | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [q, setQ] = useState('');
  const [technologyId, setTechnologyId] = useState('');
  const [featured, setFeatured] = useState<'any' | 'true' | 'false'>('any');

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (q.trim()) {
        params.set('q', q.trim());
      }
      if (technologyId) {
        params.set('technologyId', technologyId);
      }
      if (featured === 'true') {
        params.set('featured', 'true');
      }
      if (featured === 'false') {
        params.set('featured', 'false');
      }
      const res = await apiJson<PaginatedProjects>(`/admin/projects?${params.toString()}`, {
        token,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, q, technologyId, featured]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!token) {
      return;
    }
    void (async () => {
      try {
        const list = await apiJson<Technology[]>('/admin/technologies', { token });
        setTechnologies(list);
      } catch {
        // filter still works without tech list
      }
    })();
  }, [token]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-slate-400">Search, filter, and open the editor.</p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          New project
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-left text-sm text-slate-300">
          Search
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Title or description"
          />
        </label>
        <label className="flex flex-col gap-1 text-left text-sm text-slate-300">
          Technology
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
            value={technologyId}
            onChange={(e) => {
              setTechnologyId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any</option>
            {technologies.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-left text-sm text-slate-300">
          Featured
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
            value={featured}
            onChange={(e) => {
              setFeatured(e.target.value as 'any' | 'true' | 'false');
              setPage(1);
            }}
          >
            <option value="any">Any</option>
            <option value="true">Featured only</option>
            <option value="false">Not featured</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button type="button" variant="ghost" className="w-full" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      {loading && !data ? (
        <TableSkeleton rows={6} />
      ) : loading ? (
        <Spinner label="Updating list…" />
      ) : null}

      {data ? (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Featured</th>
                <th className="px-3 py-2">Technologies</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.items.map((p) => (
                <tr key={p._id} className="hover:bg-slate-900/50">
                  <td className="px-3 py-2 text-slate-100">{p.title}</td>
                  <td className="px-3 py-2">{p.featured ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 text-slate-300">
                    {p.technologies.map((t) => t.name).join(', ') || '—'}
                  </td>
                  <td className="px-3 py-2">
                    <Link className="text-violet-400 hover:underline" to={`/projects/${p._id}/edit`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-800 px-3 py-2 text-xs text-slate-400">
            <span>
              Page {data.page} · {data.total} total
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={data.page * data.limit >= data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
