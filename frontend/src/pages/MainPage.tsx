import { useUser } from "../components/profile";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as bases from "../components/bases";
import { useNavigate, Link } from "react-router-dom";
import * as components from "../components/components";
import * as constants from "../components/constants";
import { store } from "../components/store";

export default function Page() {
  const user: any = useUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const purpose = useSelector((state: any) => state.workoutPurpose);
  const profile = useSelector((state: any) => state.userName);
  const topUsers = useSelector((state: any) => state.topTenUsersByStars);
  const recomendedWorkouts = useSelector((state: any) => state.workoutListRecommended);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPurpose, setNewPurpose] = useState<number | null>(null);
  const now = new Date();
  const monthName = now.toLocaleString("ru-RU", { month: "long" });

  const getPurpose = async () => {
    if (!user) return;
    const url = `${constants.host}/api/workouts/purpose/${user.user_id}`;
    await components.constructorWebAction(dispatch, constants.workoutPurpose, url, "GET");
  };

  const getName = async () => {
    if (!user) return;
    const url = `${constants.host}/api/profile/${user.user_id}/0`;
    await components.constructorWebAction(dispatch, constants.userName, url, "GET");
  };

  const getRecommendedWorkouts = async () => {
    if (!user) return;
    const url = `${constants.host}/api/workout/recommended`;
    await components.constructorWebAction(dispatch, constants.workoutListRecommended, url, "GET");
  };

  const getTopUsersByStars = async () => {
  if (!user) return;
  const url = `${constants.host}/api/users/top/by/stars/?is_all_data=0`;
  await components.constructorWebAction(dispatch, constants.topTenUsersByStars, url, "GET");
};


  const createPurpose = async () => {
    if (!user || !newPurpose) return;
    const start_time = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    const finish_time = endDate.toISOString();

    const body = { user_id: user.user_id, start_time, finish_time, purpose: newPurpose };
    const url = `${constants.host}/api/create/workouts/purpose`;

    try {
      await components.constructorWebAction(
        dispatch,
        constants.workoutPurpose,
        url,
        "POST",
        {},
        body
      );
      await getPurpose();
      setShowCreateForm(false);
    } catch (err) {
      console.error("Ошибка при создании цели:", err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Доброе утро, ";
    if (hour >= 12 && hour < 18) return "Добрый день, ";
    if (hour >= 18 && hour < 23) return "Добрый вечер, ";
    return "Доброй ночи, ";
  };

  const handleRepeatWorkout = async (workout_id: number) => {
    const url = `${constants.host}/api/workout/repeat/planned/info/${user.user_id}/${workout_id}`;
    try {
      await components.constructorWebAction(dispatch, constants.workoutRepeatId, url, "GET");
      // @ts-ignore
      const stateData = store.getState().workoutRepeatId?.data;
      if (stateData?.workout_id) {
        navigate(`/workouts/training/${stateData.workout_id}/user/${user.user_id}/`);
      } else {
        console.error("Не удалось получить новый workout_id:", stateData);
      }
    } catch (err) {
      console.error("Ошибка при повторении тренировки:", err);
    }
  };

  useEffect(() => {
    getPurpose();
    getName();
    getRecommendedWorkouts();
    getTopUsersByStars();
  }, [user]);

  const hasWorkouts = recomendedWorkouts?.data && recomendedWorkouts.data.length > 0;
  const hasTopUsers = topUsers?.data && topUsers.data.length > 0;

  return (
    <bases.Base>
      <div className="flex flex-col w-full mt-10">
        {/* === Приветствие и цели === */}
        <div className="p-4 flex flex-col md:flex-row w-full md:w-11/12 justify-between items-start text-3xl md:text-5xl items-center md:items-start">
          {profile?.data && !profile.load && (
            <div className="flex flex-col md:flex-row md:gap-x-5 items-center">
              <h1 className="text-slate-100 font-bold">{getGreeting()}</h1>
              <h1 className="text-slate-100 text-4xl md:text-6xl font-bold">
                {profile.data}!
              </h1>
            </div>
          )}

          {/* Прогресс цели */}
          <div className="flex justify-center md:justify-end items-center w-full md:w-1/2 mt-6 md:mt-0">
            {purpose.data && !purpose.load && !profile.load && !recomendedWorkouts.load && !topUsers.load &&(
              <div className="bg-white shadow-md rounded-2xl p-4 text-center">
                <h3 className="font-semibold text-lg mb-2">
                  Прогресс количества тренировок за {monthName}
                </h3>
                <p className="text-sm text-gray-600">
                  Выполнено: {purpose.data.workouts_count} /{" "}
                  {purpose.data.workouts_count_purpose}
                </p>
                <div className="w-full bg-gray-200 h-3 rounded-full mt-2">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (purpose.data.workouts_count /
                          purpose.data.workouts_count_purpose) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {!purpose.data && !purpose.load && !showCreateForm && !profile.load && !recomendedWorkouts.load && !topUsers.load &&(
              <div className="w-full sm:w-60 flex justify-center p-3 text-center bg-cyan-600 hover:bg-slate-100 rounded-3xl transition text-slate-100 hover:text-cyan-600">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="text-lg sm:text-xl font-bold leading-9 tracking-tight"
                >
                  Добавить цель посещений на {monthName}
                </button>
              </div>
            )}

            {showCreateForm && !profile.load && !recomendedWorkouts.load && !topUsers.load &&(
              <div className="bg-white shadow-md rounded-2xl p-4 text-center w-4/5">
                <div className="flex flex-col sm:items-center md:justify-between gap-y-2 sm:gap-y-0">
                  <h3 className="font-semibold text-lg sm:text-xl">
                    Цель посещений на {monthName}
                  </h3>
                  <div className="mt-2">
                    <NumericInput
                      value={newPurpose}
                      placeholder="Количество дней"
                      onChange={setNewPurpose}
                      min={1}
                    />
                  </div>
                  <div className="flex justify-end gap-x-2">
                    <button
                      onClick={createPurpose}
                      className="bg-cyan-600 text-slate-100 px-2 py-1 rounded-md text-lg hover:bg-white hover:text-cyan-600 border-2 border-cyan-600 transition-colors duration-200"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="bg-cyan-600 text-slate-100 px-3 py-1 rounded-md text-lg hover:bg-white hover:text-cyan-600 border-2 border-cyan-600 transition-colors duration-200"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === Рекомендованные тренировки === */}
        {hasWorkouts && !recomendedWorkouts.load && !profile.load && !purpose.load && !topUsers.load &&(
          <div className="flex flex-col mt-7">
            <h1 className="text-2xl md:text-4xl text-slate-100 font-semibold ml-6 sm:ml-16">
              Попробуй эти тренировки 🔥
            </h1>
            <div className="overflow-x-auto scrollbar-thin mt-3 px-4">
              <div className="flex gap-4">
                {recomendedWorkouts.data.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex-none w-60 bg-white shadow-md rounded-xl overflow-hidden"
                  >
                    <img
                      src={`${constants.host}${item.avatar}`}
                      alt={`fitness-${item.id}`}
                      className="w-full h-28 object-cover"
                    />
                    <div className="flex flex-col items-center text-center gap-y-2 p-3 text-slate-800">
                      <h1 className="font-bold text-base">{item.name}</h1>
                      <div className="flex gap-x-3 items-center font-semibold">
                        <p className="text-xs text-gray-600">
                          Упражнений: {item.exercises_count}
                        </p>
                        <span className="text-[10px] bg-yellow-400 border rounded-lg px-2 py-0.5">
                          {item.type ?? "Тип не указан"}
                        </span>
                      </div>
                      <button
                        className="mt-2 bg-cyan-600 hover:bg-slate-100 rounded-2xl text-slate-100 hover:text-cyan-600 transition"
                        onClick={() => handleRepeatWorkout(item.id)}
                      >
                        <h1 className="px-10 py-2 text-xs font-bold">Начать</h1>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {!purpose.load && profile.data && !recomendedWorkouts.load && topUsers.data &&(
          <Link
            to="/exercises"
            className="w-11/12 bg-yellow-500 p-10 mt-5 flex items-center justify-around m-auto rounded-xl text-slate-100 font-semibold text-xl md:text-3xl hover:bg-slate-100 hover:text-yellow-500 transition "
          >
            <p>Инструкция к упражнениям</p>
            <div className="flex items-end text-lg font-semibold leading-6 justify-center">
              <span className="text-3xl text-cyan-600">Fitness</span>
              <span className="text-slate-600">helper</span>
            </div>
          </Link>
        )}
        <div className="mb-20"></div>

          {hasTopUsers && !topUsers.load && !purpose.load && !profile.load && !recomendedWorkouts.load && (
            <div className="m-auto w-11/12 sm:w-3/5 flex flex-col items-center text-slate-100 px-4 border-2 border-slate-100 rounded-2xl">
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center mt-10">
                Топ пользователей
              </h1>

              <div className="w-full max-w-5xl">
                <div className="hidden sm:grid grid-cols-12 py-3 px-4 border-b border-slate-700 text-slate-400 text-sm font-semibold">
                  <div className="col-span-1 text-left">#</div>
                  <div className="col-span-6 sm:col-span-7 text-left">Пользователь</div>
                  <div className="col-span-2 text-right">Звёзды</div>
                </div>

                <div className="divide-y divide-slate-700 max-h-[300px] overflow-y-auto w-full">
                  {topUsers.data.map((user: any, index: number) => {
                  let borderClass = "";
                  if (index === 0 ) borderClass = "border-2 border-yellow-400";

                  return (
                    <div
                      key={user.user_id}
                      className={`w-full py-2 px-2 mb-2 rounded-xl hover:bg-slate-800/40 transition-all ${borderClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm mr-3">#{index + 1}</span>
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={`${constants.host}${user.avatar}`}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <span className="font-semibold text-base">
                            {`${user.name} ${user.surname}`.slice(0, 16)}
                            {`${user.name} ${user.surname}`.length > 16 ? '...' : ''}
                          </span>
                        </div>
                        <span className="text-cyan-400 font-semibold mr-0 md:mr-32">{user.stars} ⭐</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  </bases.Base>
  );
}

function NumericInput({
  value,
  placeholder,
  onChange,
  min = 0,
}: {
  value: number | null;
  placeholder: string;
  onChange: (val: number | null) => void;
  min?: number;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={min}
      className="no-spinner border p-2 rounded-lg w-full text-center text-lg"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Math.max(min, +e.target.value))
      }
      onKeyDown={(e) => {
        if (
          !/[0-9]/.test(e.key) &&
          !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();
        }
      }}
    />
  );
}
