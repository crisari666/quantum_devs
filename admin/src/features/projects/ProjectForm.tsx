import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { TextField } from '../../components/TextField';
import { ApiError, apiJson } from '../../lib/api';
import { useAppSelector } from '../../store/hooks';

type Technology = { _id: string; name: string; iconKey: string; category: string };

type ProjectAdmin = {
  _id: string;
  title: string;
  description: string;
  url: string;
  images: string[];
  githubUrl: string | null;
  featured: boolean;
  technologies: Technology[];
};

const projectFormSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(10000),
    url: z.string().url(),
    githubUrl: z.string().optional(),
    featured: z.boolean(),
    technologyIds: z.array(z.string()),
    imagesText: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const g = val.githubUrl?.trim();
    if (g) {
      const r = z.string().url().safeParse(g);
      if (!r.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid URL',
          path: ['githubUrl'],
        });
      }
    }
  });

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function ProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const token = useAppSelector((s) => s.auth.token);
  const navigate = useNavigate();
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(() => isEdit);

  const defaultValues = useMemo(
    () =>
      ({
        title: '',
        description: '',
        url: '',
        githubUrl: '',
        featured: false,
        technologyIds: [] as string[],
        imagesText: '',
      }) satisfies ProjectFormValues,
    [],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!token) {
      return;
    }
    void (async () => {
      try {
        const list = await apiJson<Technology[]>('/admin/technologies', { token });
        setTechnologies(list);
      } catch {
        setLoadError('Could not load technologies');
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!isEdit || !id || !token) {
      return;
    }
    void (async () => {
      try {
        const p = await apiJson<ProjectAdmin>(`/admin/projects/${id}`, { token });
        reset({
          title: p.title,
          description: p.description,
          url: p.url,
          githubUrl: p.githubUrl ?? '',
          featured: p.featured,
          technologyIds: p.technologies.map((t) => t._id),
          imagesText: (p.images ?? []).join('\n'),
        });
      } catch (e) {
        setLoadError(e instanceof ApiError ? e.message : 'Failed to load project');
      } finally {
        setInitializing(false);
      }
    })();
  }, [id, isEdit, reset, token]);

  const toggleTechnology = (techId: string, checked: boolean, current: string[]) => {
    if (checked) {
      return [...current, techId];
    }
    return current.filter((x) => x !== techId);
  };

  const onSubmit = async (values: ProjectFormValues) => {
    if (!token) {
      return;
    }
    setSubmitError(null);
    const images =
      values.imagesText
        ?.split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0) ?? [];
    const githubUrl = values.githubUrl?.trim() ? values.githubUrl.trim() : undefined;
    const payload = {
      title: values.title,
      description: values.description,
      url: values.url,
      featured: values.featured,
      technologyIds: values.technologyIds,
      images: images.length > 0 ? images : undefined,
      githubUrl,
    };
    try {
      if (isEdit && id) {
        await apiJson(`/admin/projects/${id}`, {
          method: 'PUT',
          token,
          body: JSON.stringify(payload),
        });
      } else {
        await apiJson('/admin/projects', {
          method: 'POST',
          token,
          body: JSON.stringify(payload),
        });
      }
      navigate('/projects');
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Save failed');
    }
  };

  if (initializing) {
    return (
      <div className="px-4 py-16">
        <Spinner label="Loading project…" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {isEdit ? 'Edit project' : 'New project'}
          </h1>
          <p className="text-sm text-slate-400">Fields are validated with Zod before save.</p>
        </div>
        <Link to="/projects" className="text-sm text-violet-400 hover:underline">
          Back to list
        </Link>
      </div>

      {loadError ? <p className="text-sm text-rose-400">{loadError}</p> : null}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField label="Title" error={errors.title?.message} {...register('title')} />
        <label className="flex flex-col gap-1 text-left text-sm text-slate-300">
          Description
          <textarea
            className="min-h-[120px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none"
            {...register('description')}
          />
          {errors.description?.message ? (
            <span className="text-xs text-rose-400">{errors.description.message}</span>
          ) : null}
        </label>
        <TextField label="Primary URL" error={errors.url?.message} {...register('url')} />
        <TextField
          label="GitHub URL (optional)"
          error={errors.githubUrl?.message}
          {...register('githubUrl')}
        />
        <label className="flex flex-col gap-1 text-left text-sm text-slate-300">
          Image URLs (one per line)
          <textarea
            className="min-h-[80px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none"
            {...register('imagesText')}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" {...register('featured')} />
          Featured
        </label>

        <fieldset className="rounded-md border border-slate-800 p-3">
          <legend className="px-1 text-sm text-slate-300">Technologies</legend>
          <Controller
            name="technologyIds"
            control={control}
            render={({ field }) => (
              <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto text-left text-sm text-slate-200 md:grid-cols-2">
                {technologies.map((t) => {
                  const checked = field.value.includes(t._id);
                  return (
                    <label key={t._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          field.onChange(toggleTechnology(t._id, e.target.checked, field.value))
                        }
                      />
                      <span>
                        {t.name}{' '}
                        <span className="text-xs text-slate-500">({t.category})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          />
          {errors.technologyIds?.message ? (
            <p className="mt-2 text-xs text-rose-400">{errors.technologyIds.message}</p>
          ) : null}
        </fieldset>

        {submitError ? <p className="text-sm text-rose-400">{submitError}</p> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/projects')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
