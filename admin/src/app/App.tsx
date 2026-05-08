import { Provider } from 'react-redux';
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { ProjectForm } from '../features/projects/ProjectForm';
import { ProjectsPage } from '../features/projects/ProjectsPage';
import { TechnologiesPage } from '../features/technologies/TechnologiesPage';
import { clearToken } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { store } from '../store/store';

function ProtectedLayout() {
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link className="font-semibold text-white" to="/projects">
              CMS Admin
            </Link>
            <Link className="text-slate-300 hover:text-white" to="/projects">
              Projects
            </Link>
            <Link className="text-slate-300 hover:text-white" to="/technologies">
              Technologies
            </Link>
          </nav>
          <button
            type="button"
            className="text-sm text-slate-400 hover:text-white"
            onClick={() => dispatch(clearToken())}
          >
            Sign out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/:id/edit" element={<ProjectForm />} />
          <Route path="/technologies" element={<TechnologiesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
