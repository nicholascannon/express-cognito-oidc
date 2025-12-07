import { useMe } from './hooks/use-me';

export function App() {
  const { me, loading } = useMe();

  const login = () => {
    window.location.href = 'http://localhost:8000/auth/login';
  };

  const logout = async () => {
    const response = await fetch('http://localhost:8000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    const { logoutUrl } = await response.json();
    window.location.href = logoutUrl;
  };

  return (
    <main>
      {loading && <p>Loading...</p>}

      {!loading && me && (
        <section>
          <p>Hello, {me.email}</p>

          <button onClick={logout}>Logout</button>
        </section>
      )}

      {!loading && !me && (
        <section>
          <h1>Not logged in</h1>

          <button onClick={login}>Login</button>
        </section>
      )}
    </main>
  );
}
