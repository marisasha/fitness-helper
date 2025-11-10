import { useUser } from "../components/profile";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function ExerciseStatisticsPage() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const { exerciseName } = useParams<{ exerciseName: string }>();
  const exerciseStatistics = useSelector((state: any) => state.exerciseStatistics);

  const getExerciseStatistics = async () => {
    if (!user || !exerciseName) return;
    const encodedName = encodeURIComponent(exerciseName);
    const url = `${constants.host}/api/workouts/statistics/exercise/${user.user_id}?exercise_name=${encodedName}`;
    try {
      await components.constructorWebAction(dispatch, constants.exerciseStatistics, url, "GET");
    } catch (err) {
      console.error("Ошибка при загрузке статистики упражнения:", err);
    }
  };

  useEffect(() => {
    getExerciseStatistics();
  }, [user, exerciseName]);
  
  useEffect(() => {
    console.log(exerciseStatistics)
  }, [exerciseStatistics]);

  if (!user) {
    return (
      <bases.Base>
        <div className="p-5">
          <h1 className="text-xl font-bold">Статистика упражнения</h1>
          <p>Вы не авторизованы или данные пользователя ещё загружаются</p>
        </div>
      </bases.Base>
    );
  }

  const data = exerciseStatistics?.data;
  const stats = data?.stats?.[0];
  const hasStats = stats && Object.keys(stats).length > 0;
  const maxByWeight = data?.max_by_weight || [];
  const maxBySpeed = data?.max_by_speed || [];
  const topApproaches = data?.top_approaches || [];
  const lastDate = data?.last_workout_date
    ? new Date(data.last_workout_date).toLocaleString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <bases.Base>
      <div className="w-full mt-20 px-4 flex justify-center">
        <div className="flex flex-col gap-y-6 w-full max-w-5xl">
          {/* Заголовок */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2 items-center flex flex-col gap-y-4">
            Статистика упражнения:
            {exerciseName && (
              <span className="text-3xl">{(exerciseName)}</span>
            )}
          </h1>

          {/* Основные показатели */}
          {hasStats ? (
            <>
              <div className="flex items-center justify-around text-center p-4 rounded-2xl text-slate-100 border-2 border-slate-100">
                {stats.total_approaches !== undefined && (
                  <div>
                    <p className="text-lg font-bold">{stats.total_approaches}</p>
                    <p className="text-sm text-slate-400">Всего выполнений</p>
                  </div>
                )}
                {stats.max_count !== undefined && (
                  <div>
                    <p className="text-lg font-bold">{stats.max_count}</p>
                    <p className="text-sm text-slate-400">Макс. повторений</p>
                  </div>
                )}
                {stats.max_weight !== undefined && (
                  <div>
                    <p className="text-lg font-bold">{stats.max_weight}</p>
                    <p className="text-sm text-slate-400">Макс. вес</p>
                  </div>
                )}
                {stats.max_speed !== undefined && (
                  <div>
                    <p className="text-lg font-bold">{stats.max_speed} </p>
                    <p className="text-sm text-slate-400">Макс. скорость(км/ч)</p>
                  </div>
                )}
                {stats.avg_time !== undefined && (
                  <div>
                    <p className="text-lg font-bold">
                      {(stats.avg_time / 60).toFixed(1)} 
                    </p>
                    <p className="text-sm text-slate-400">Сред. время(мин)</p>
                  </div>
                )}
                {stats.max_time !== undefined && (
                  <div>
                    <p className="text-lg font-bold">
                      {(stats.max_time / 60).toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-400">Макс. время(мин)</p>
                  </div>
                )}
              </div>

              {/* Последняя дата */}
              {lastDate && (
                <p className="text-slate-300 mt-2 text-sm">
                  Последняя тренировка с выполнением упражнения:{" "}
                  <span className="text-cyan-400">{lastDate}</span>
                </p>
              )}
            </>
          ) : ""}

          {/* Таблицы (если есть) */}
          {maxByWeight.length > 0 && (
            <div className="overflow-x-auto rounded-2xl mt-6 border-2">
              <h2 className="text-xl text-slate-100 m-3 font-semibold">
                Зависимость от веса
              </h2>
              <table className="min-w-full border border-slate-300 bg-white rounded-xl shadow-md text-xs md:text-sm">
                <thead className="bg-slate-100">
                  <tr className="text-center ">
                    <th className="px-2 py-3 border w-1/2">Вес (кг)</th>
                    <th className="px-2 py-3 border w-1/2">Макс. повторений (раз)</th>
                  </tr>
                </thead>
                <tbody>
                  {maxByWeight.map((item: any, idx: number) => (
                    <tr key={idx} className="text-center hover:bg-slate-50 transition">
                      <td className="px-2 py-3 border font-semibold">
                        {item.weight_exercise_equipment}
                      </td>
                      <td className="px-2 py-3 border">{item.max_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {maxBySpeed.length > 0 && (
            <div className="overflow-x-auto rounded-2xl mt-6  border-2">
              <h2 className="text-xl text-slate-100 m-3 font-semibold">
                Зависимость от скорости
              </h2>
              <table className="min-w-full border border-slate-300 bg-white rounded-xl shadow-md text-xs md:text-sm">
                <thead className="bg-slate-100">
                  <tr className="text-center">
                    <th className="px-2 py-3 border">Скорость (км/ч)</th>
                    <th className="px-2 py-3 border">Макс. время (мин)</th>
                  </tr>
                </thead>
                <tbody>
                  {maxBySpeed.map((item: any, idx: number) => (
                    <tr key={idx} className="text-center hover:bg-slate-50 transition">
                      <td className="px-2 py-3 border font-semibold">
                        {item.speed_exercise_equipment}
                      </td>
                      <td className="px-2 py-3 border">
                        {(item.max_time / 60).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {topApproaches.length > 0 && (
            <div className="overflow-x-auto rounded-2xl mt-6 border-2">
              <h2 className="text-xl text-slate-100 m-3 font-semibold">Топ подходов</h2>
              <table className="min-w-full border border-slate-300 bg-white rounded-xl shadow-md text-xs md:text-sm">
                <thead className="bg-slate-100">
                  <tr className="text-center">
                    <th className="px-2 py-3 border">Количество повторений</th>
                  </tr>
                </thead>
                <tbody>
                  {topApproaches.map((item: any, idx: number) => (
                    <tr key={idx} className="text-center hover:bg-slate-50 transition">
                      <td className="px-2 py-3 border font-semibold">
                        {item.count_approach}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </bases.Base>
  );
}
