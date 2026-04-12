import { useContext } from "react";
import { AuthContext } from "../features/auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user,logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    logout();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold">Your Projects</h2>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">
          Hi, {user?.email?.split("@")[0] || "User"}
        </span>

        <button
          onClick={handleLogout}
          className="text-sm bg-blue-500 px-3 py-1 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}