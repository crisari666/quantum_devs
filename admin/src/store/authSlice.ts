import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const AUTH_KEY = 'cms_auth';

export type AuthState = {
  token: string | null;
};

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { token?: string };
    return typeof parsed.token === 'string' ? parsed.token : null;
  } catch {
    return null;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: readStoredToken() } satisfies AuthState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token: action.payload }));
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem(AUTH_KEY);
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
