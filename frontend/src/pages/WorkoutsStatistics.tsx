import { useUser } from "../components/profile";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";
import { Link } from "react-router-dom";

export default function WorkoutStatisticsPage() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const statistics = useSelector((state: any) => state.workoutsStatistics);

  const [filter, setFilter] = useState("week");

  const getStatistics = async () => {
    if (!user) return;
    const url = `${constants.host}/api/workouts/statistics/${user.user_id}?filter=${filter}`;
    try {
      await components.constructorWebAction(dispatch, constants.workoutsStatistics, url, "GET");
    } catch (err) {
      console.error("Ошибка при загрузке статистики:", err);
    }
  };

  useEffect(() => {
    getStatistics();
    
  }, [user, filter]);

  if (!user) {
    return (
      <bases.Base>
        <div className="p-5">
          <h1 className="text-xl font-bold">Статистика тренировок</h1>
          <p>Вы не авторизованы или данные пользователя ещё загружаются</p>
        </div>
      </bases.Base>
    );
  }



  const hasStatistics = statistics?.data && statistics.data.length > 0;
  
  return (
    <bases.Base>
      <div className="w-full mt-20 px-4 flex justify-center">
        <div className="flex flex-col gap-y-5 w-full max-w-5xl">
          <h1 className="text-2xl sm:text-3xl font-bold leading-9 tracking-tight text-slate-100 mb-6 flex items-center">
            Статистика тренировок 
            {statistics.load && (
              <div className="ml-3 w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h1>

          {/* Фильтры */}
          <div className="flex gap-3 mb-6">
            {["week", "month", "all_time"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl transition ${
                  filter === f
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {f === "week"
                  ? "Неделя"
                  : f === "month"
                  ? "Месяц"
                  : "Всё время"}
              </button>
            ))}
          </div>

          {/* Таблица */}
          {hasStatistics ? (
            <div className="overflow-x-auto rounded-2xl ">
              <table className="min-w-full border border-slate-300 bg-white rounded-xl shadow-md text-xs md:text-sm">
                <thead className="bg-slate-100">
                  <tr className="text-center">
                    <th className="px-2 py-4 border">Упражнение</th>
                    <th className="px-2 py-4 border">Подходы <br />(раз)</th>
                    <th className="px-2 py-4 border">Макс.кол-во <br />выполнений <br />(раз)</th>
                    <th className="px-2 py-4 border">Макс. вес <br />(кг)</th>
                    <th className="px-2 py-4 border">Макс. скорость <br />(км/ч)</th>

                    <th className="px-2 py-4 border">Сред. время<br />(мин)</th>
                    <th className="px-2 py-4 border ">Макс. время<br />(мин)</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.data.map((item: any, idx: number) => (
                    <tr
                      key={idx}
                      className="text-center hover:bg-slate-50 transition"
                    >
                      <td className="px-2 py-4 border font-semibold"><Link to={`/workouts-statistics/exercise/${item.name}`}>{item.name}</Link></td>
                      <td className="px-2 py-4 border">{item.total_approaches ? item.total_approaches : (<i className="fa-solid fa-xmark text-cyan-600"></i>)}</td>
                      <td className="px-2 py-4 border">{item.max_count ? item.max_count : (<i className="fa-solid fa-xmark text-cyan-600"></i>)}</td>
                      <td className="px-2 py-4 border">{item.max_weight ? item.max_weight : (<i className="fa-solid fa-xmark text-cyan-600"></i>)} </td>                 
                      <td className="px-2 py-4 border">{item.max_speed ? item.max_speed : (<i className="fa-solid fa-xmark text-cyan-600"></i>)} </td>
                      <td className="px-2 py-4 border">{item.avg_time ? item.avg_time/60 : (<i className="fa-solid fa-xmark text-cyan-600"></i>)} </td>
                      <td className="px-2 py-4 border ">{item.max_time ? item.max_time/60 : (<i className="fa-solid fa-xmark text-cyan-600"></i>)} </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !statistics.load ? 
            <p className="w-full text-base sm:text-lg text-slate-200 text-center sm:text-left">
              Данных по статистике за этот период нет
            </p>:""
          )}
        </div>
      </div>
    </bases.Base>
  );
}
