export default function Home() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-green-500 min-h-screen flex items-center justify-center text-white">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-semibold">Bienvenido al Sistema de Login Híbrido</h1>
        <p className="text-lg">Puedes iniciar sesión con tu cuenta o con Google</p>
        <div className="space-y-4">
          <a href="/login" className="block bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition">
            Iniciar sesión
          </a>
          <a href="/register" className="block bg-white text-green-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition">
            Registrarse
          </a>
        </div>
      </div>
    </div>
  );
}
