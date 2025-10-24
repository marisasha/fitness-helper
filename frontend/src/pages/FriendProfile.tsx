import { useUser } from "../components/profile";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function ProfilePage() {
  const user: any = useUser();
  const { friendId } = useParams()
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const friendProfile = useSelector((state: any) => state.friendProfile || {});
  
  const getProfile = async () => {
    if (!user) return;
    const url = `${constants.host}/api/profile/${friendId}/1`;
    try {
      await components.constructorWebAction(
        dispatch,
        constants.friendProfile,
        url,
        "GET",
      );
    } catch (err) {
      console.error("Ошибка при загрузке профиля:", err);
    }
  };
  
  const deleteFriend = async (from_user: number, to_user: number) => {
      if (!from_user || !to_user) return;
      const body = { from_user, to_user };
      const url = `${constants.host}/api/delete/friend`;
  
      try {
        await components.constructorWebAction(dispatch, constants.deleteFriend, url, "DELETE", {}, body);
        alert("Друг удален");
        navigate("/friends")
      } catch (err) {
        console.error("Ошибка отправки запроса", err);
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
  const hasfriendProfile = friendProfile?.data && Object.keys(friendProfile.data).length > 0;

  return (
    <bases.Base>
      <div className="flex justify-center m-auto px-4">
        <div className="flex flex-row items-center gap-6 md:gap-10 flex-wrap sm:flex-nowrap justify-center mt-24 ">
          <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[500px] lg:h-[500px] overflow-hidden  flex-shrink-0">
            <img
              src={hasfriendProfile ? `${constants.host}${friendProfile.data.avatar}`:""} 
              alt="Аватар"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col justify-center gap-4 w-full sm:w-auto max-w-xs md:max-w-md">
            <div className="text-left">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-slate-100">
                {hasfriendProfile ? `${friendProfile.data.name} ${friendProfile.data.surname}` : ""}
              </h1>
              <p className="mt-2 text-sm sm:text-lg md:text-2xl text-slate-300">
                {hasfriendProfile
                  ? `${getAge(friendProfile.data.birth_date)} лет • ${friendProfile.data.weight} кг • ${friendProfile.data.height} см`
                  : ""}
              </p>
            </div>


            <div className="flex flex-col gap-3 w-full">
              <Link
                to={`/workouts/completed-workouts/${friendId}`}
                className="w-full sm:w-36 md:w-64 bg-cyan-600 text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
              >
                История тренировок
              </Link>
              <Link
                to={`/friend/workouts-statistics/${friendId}`}
                className="w-full sm:w-36 md:w-64 bg-cyan-600 text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
              >
                Статистика тренировок
              </Link>
              <button
                className="w-full sm:w-36 md:w-64 bg-cyan-600 text-slate-100 px-3 py-2 rounded-xl shadow hover:bg-slate-100 hover:text-cyan-600 text-center font-semibold text-sm sm:text-base"
                onClick={(e) => {
                  // @ts-ignore
                  deleteFriend(friendId, user.user_id);
                }}
              >
                Удалить из друзей
              </button>
            </div>
          </div>
        </div>
      </div>
    </bases.Base>
  );
}
