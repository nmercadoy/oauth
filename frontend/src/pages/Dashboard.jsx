import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState({}, document.title, '/dashboard');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:3000/perfil', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then(data => {
        localStorage.setItem("user", JSON.stringify(data.usuario));
        setUser(data.usuario);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-gray-100 min-h-screen flex font-sans">
      <aside className="w-64 bg-blue-800 text-white flex flex-col justify-between p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold mb-8">🌐 DevAuth</h2>
          <nav className="space-y-4">
            <a href="#" className="block hover:text-yellow-300">🔒 Autenticación</a>
            <a href="#" className="block hover:text-yellow-300">🛠️ Herramientas</a>
            <a href="#" className="block hover:text-yellow-300">📚 Documentación</a>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold mt-6"
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Panel del Usuario</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-2">
            <h2 className="text-xl font-semibold text-blue-700">👤 Información de la Cuenta</h2>
            {user ? (
              <div className="text-gray-700">
                <p><strong>👤 Usuario:</strong> {user.username}</p>
                <p><strong>📧 Email:</strong> {user.email}</p>
              </div>
            ) : (
              <p className="text-gray-600">Cargando datos...</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-2">
            <h2 className="text-xl font-semibold text-blue-700">💡 Estado del Sistema</h2>
            <ul className="text-gray-700 list-disc ml-6">
              <li>Login local habilitado ✅</li>
              <li>Login con Google activo 🔐</li>
              <li>Protección con JWT funcionando 🔒</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
