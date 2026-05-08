import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { TableSkeleton } from '../../components/TableSkeleton';
import { TextField } from '../../components/TextField';
import { ApiError, apiJson } from '../../lib/api';
import {
  technologyWriteSchema,
  type TechnologyWriteValues,
} from '../../lib/schemas/technologyWrite';
import { useAppSelector } from '../../store/hooks';

type Technology = { _id: string; name: string; iconKey: string; category: string };

export function TechnologiesPage() {
  const token = useAppSelector((s) => s.auth.token);
  const [items, setItems] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setListError(null);
    try {
      const res = await apiJson<Technology[]>('/admin/technologies', { token });
      setItems(res);
    } catch (e) {
      setListError(e instanceof ApiError ? e.message : 'Failed to load technologies');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TechnologyWriteValues>({
    resolver: zodResolver(technologyWriteSchema),
    defaultValues: { name: '', iconKey: '', category: '' },
  });

  const onCreate = async (values: TechnologyWriteValues) => {
    if (!token) {
      return;
    }
    setToast(null);
    try {
      await apiJson('/admin/technologies', {
        method: 'POST',
        token,
        body: JSON.stringify(values),
      });
      reset();
      setToast('Technology created');
      await load();
    } catch (e) {
      setToast(e instanceof ApiError ? e.message : 'Create failed');
    }
  };

  const onDelete = async (id: string) => {
    if (!token) {
      return;
    }
    setToast(null);
    try {
      await apiJson(`/admin/technologies/${id}`, { method: 'DELETE', token });
      setToast('Deleted');
      await load();
    } catch (e) {
      setToast(e instanceof ApiError ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Technologies</h1>
        <p className="text-sm text-slate-400">Manage catalog entries used on projects.</p>
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-lg font-medium text-slate-100">Add technology</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-3"
          onSubmit={handleSubmit(onCreate)}
          noValidate
        >
          <TextField label="Name" error={errors.name?.message} {...register('name')} />
          <TextField label="Icon key" error={errors.iconKey?.message} {...register('iconKey')} />
          <TextField label="Category" error={errors.category?.message} {...register('category')} />
          <div className="md:col-span-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Create'}
            </Button>
          </div>
        </form>
      </section>

      {toast ? (
        <p className="text-sm text-slate-300" role="status">
          {toast}
        </p>
      ) : null}
      {listError ? <p className="text-sm text-rose-400">{listError}</p> : null}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-100">Catalog</h2>
          <Button type="button" variant="ghost" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
        {loading ? <TableSkeleton rows={5} /> : null}
        {!loading && items.length === 0 ? (
          <p className="text-sm text-slate-400">No technologies yet.</p>
        ) : null}
        {!loading && items.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Icon</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-900/50">
                    <td className="px-3 py-2 text-slate-100">{t.name}</td>
                    <td className="px-3 py-2 text-slate-300">{t.category}</td>
                    <td className="px-3 py-2 text-slate-400">{t.iconKey}</td>
                    <td className="px-3 py-2">
                      <Button type="button" variant="danger" onClick={() => void onDelete(t._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
