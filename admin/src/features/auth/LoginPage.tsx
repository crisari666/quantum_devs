import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { ApiError, apiJson } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { setToken } from '../../store/authSlice';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const res = await apiJson<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      dispatch(setToken(res.accessToken));
      navigate('/projects', { replace: true });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Login failed';
      setFormError(msg);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-white">Admin sign in</h1>
        <p className="mt-1 text-sm text-slate-400">Use your CMS administrator credentials.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {formError ? <p className="text-sm text-rose-400">{formError}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
