import { useUser } from "../components/profile";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

const PAGE_SIZE = 9;

export default function Page() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const workout = useSelector((state: any) => state.workoutList);

  const [currentPage, setCurrentPage] = useState(1);

  // Получение завершённых тренировок с сервера
  const getWorkout = async (page: number = 1) => {
    if (!user) return;
    const url = `${constants.host}/api/all/workouts/planned/user/${user.user_id}/1?page=${page}&page_size=${PAGE_SIZE}`;
    try {
      await components.constructorWebAction(dispatch, constants.workoutList, url, "GET");
    } catch (err) {
      console.error("Ошибка при загрузке тренировок:", err);
    }
  };

  useEffect(() => {
    getWorkout(currentPage);
  }, [user, currentPage]);

  if (!user) return <bases.Base />;

  const workoutResults = workout?.data?.results ?? [];
  const totalPages = workout?.data?.total_pages ?? 1;
  const hasWorkouts = workoutResults.length > 0;

  return (
    <bases.Base>
      <div className="w-full px-4 flex justify-center">
        <div className="flex flex-col gap-y-5 w-full max-w-5xl">
          {/* Кнопка Создать план */}
          <div className="mb-5 flex justify-center sm:justify-start">
            <Link to="/workouts/create-workout/">
              <div className="w-full sm:w-60 flex justify-center p-3 text-center bg-cyan-600 hover:bg-slate-100 rounded-3xl transition mt-20 text-slate-100 hover:text-cyan-600">
                <h1 className="text-lg sm:text-xl font-bold leading-9 tracking-tight">
                  Создать план тренировки
                </h1>
              </div>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold leading-9 tracking-tight text-slate-100 mb-6 flex items-center gap-3">
            Ваши запланированные тренировки:
            {workout.load && (
              <div className="w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h1>

          {/* Пустое состояние */}
          {!hasWorkouts && !workout.load && (
            <p className="w-full text-base sm:text-lg text-slate-200 text-center sm:text-left">
              У вас нет ещё запланированных тренировок
            </p>
          )}

          {/* Список тренировок */}
          {hasWorkouts && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {workoutResults.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-2xl bg-white shadow-md overflow-hidden"
                  >
                    <img
                      src={`${constants.host}${item.avatar}`}
                      alt={`fitness-${item.id}`}
                      className="w-full h-44 object-cover"
                    />

                    <div className="flex flex-col items-center text-center gap-y-4 p-4 text-slate-800">
                      <h1 className="font-bold text-lg sm:text-xl leading-7 tracking-tight">
                        {item.name}
                      </h1>
                      <div className="text-sm sm:text-base">
                        <p>Количество упражнений: {item.exercises_count}</p>
                        <p className="mt-1">
                          Тип тренировки:{" "}
                          <span className="text-xs sm:text-sm bg-yellow-400 border rounded-lg px-2 py-0.5">
                            {item.type ?? "Не указан"}
                          </span>
                        </p>
                      </div>

                      <Link
                        to={`/workouts/training/${item.id}/user/${user.user_id}`}
                        className="w-full"
                      >
                        <div className="mt-3 flex justify-center bg-cyan-600 hover:bg-slate-100 rounded-3xl transition text-slate-100 hover:text-cyan-600">
                          <h1 className="p-2 text-sm sm:text-lg font-bold leading-7 tracking-tight">
                            Начать тренировку
                          </h1>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Навигатор страниц */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 mb-8 gap-2">
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === idx + 1
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </bases.Base>
  );
}
