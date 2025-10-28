import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav
      className="m-0 flex flex-col justify-between w-full fixed top-0 left-0 bg-slate-100 border rounded-b-3xl shadow-sm z-50"
      aria-label="Global"
    >
      <div className="flex items-end justify-center gap-x-3 md:mt-2 md:mb-3">
        <div className="flex gap-x-6 items-center">
          <NavItem to="/home" icon="fa-house" label="Главная" />
          <NavItem to="/workouts" icon="fa-dumbbell" label="Тренировки" />
          <NavItem to="/workouts-statistics" icon="fa-square-poll-vertical" label="Статистика" />
          <NavItem to="/profile" icon="fa-user" label="Профиль" />
        </div>
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link
      to={to}
      className="
        text-cyan-600 hover:text-gray-600 font-semibold
        flex flex-col md:flex-row md:gap-x-3 items-center justify-center
        text-sm md:text-base 
        transition-all duration-200
      "
    >
      <i className={`fa-solid ${icon} text-base md:text-sm `}></i>
      <span>{label}</span>
    </Link>
  );
}
