import { useUser } from "../components/profile";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function ProfilePage() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const profile = useSelector((state: any) => state.userProfile || {});
  
  const getProfile = async () => {
    if (!user) return;
    const url = `${constants.host}/api/profile/${user.user_id}/1`;
    try {
      await components.constructorWebAction(
        dispatch,
        constants.userProfile,
        url,
        "GET",
      );
    } catch (err) {
      console.error("Ошибка при загрузке профиля:", err);
    }
  };
  
  const getAge = (birthDateStr: string | undefined | null) => {
    if (!birthDateStr) return "";
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    getProfile();
  }, [user]);
  
  if (!user) {
    return (
      <bases.Base>
        <div className="p-5">
          <h1 className="text-xl font-bold">Профиль</h1>
          <p>Вы не авторизованы или данные пользователя ещё загружаются</p>
        </div>
      </bases.Base>
    );
  }
  const hasProfile = profile?.data && Object.keys(profile.data).length > 0;

  return (
    <bases.Base>
      <div className="flex justify-center m-auto px-4">
        <div className="flex flex-col items-center gap-6 md:gap-10 md:flex-row justify-center mt-24 ">
          <div className="w-72 h-72 md:w-80 md:h-80 lg:w-[500px] lg:h-[500px] overflow-hidden  flex-shrink-0">
            <img
              src={hasProfile ? `${constants.host}${profile.data.avatar}`:""} 
              alt="Аватар"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col justify-center gap-4 w-full sm:w-auto max-w-xs md:max-w-md">
            <div className="text-left">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-slate-100">
                {hasProfile ? `${profile.data.name} ${profile.data.surname}` : ""}
              </h1>
              <p className="mt-2 text-sm sm:text-lg md:text-2xl text-slate-300">
                {hasProfile
                  ? `${getAge(profile.data.birth_date)} лет • ${profile.data.weight} кг • ${profile.data.height} см`
                  : ""}
              </p>
            </div>


            <div className="flex flex-col gap-3 w-full">
              <Link
                to={`/workouts/completed-workouts/${user.user_id}`}
                className="w-full sm:w-36 md:w-64 bg-cyan-600 text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
              >
                Мои тренировки
              </Link>
              <Link
                to="/profile/statuses"
                className="w-full sm:w-36 md:w-64 bg-cyan-600 text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
              >
                Мои достижения
              </Link>
              <Link
                to="/profile/stars-logs"
                className="w-full sm:w-36 md:w-64 bg-cyan-600  text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
              >
                Мои награды
              </Link>
              <Link
                to="/friends"
                className="w-full sm:w-36 md:w-64 bg-cyan-600 text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
              >
                Друзья
              </Link>
              <Link
                to="/profile/change-profile"
                className="w-full sm:w-36 md:w-64 bg-cyan-600  text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
              >
                Изменить профиль
              </Link>
              <Link
                to="/logout"
                className="w-full sm:w-36 md:w-64 bg-cyan-600  text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
              >
                Выйти из аккаунта
              </Link>
            </div>
          </div>
        </div>
      </div>
    </bases.Base>
  );
}
