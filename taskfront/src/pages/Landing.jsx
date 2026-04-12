import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex justify-center p-6">
        <h1 className="text-2xl font-bold tracking-wide">
          TaskFlow
        </h1>
      </nav>

      {/* Hero */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center max-w-2xl">

          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Manage your tasks <br />
            <span className="text-blue-400">like a pro</span>
          </h2>

          <p className="text-gray-300 text-lg mb-10">
            Stay organized, track your progress, and boost your productivity
            with a clean and simple workflow.
          </p>

          <Link
            to="/register"
            className="px-10 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 transition text-lg font-medium"
          >
            Get Started
          </Link>

        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto p-6 mb-10">
        
        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Projects</h3>
          <p className="text-gray-400">
            Organize your work into structured projects.
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Tasks</h3>
          <p className="text-gray-400">
            Break down your goals into manageable tasks.
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
          <p className="text-gray-400">
            Add comments and stay connected with your team.
          </p>
        </div>

      </div>
    </div>
  );
}