import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function WorkoutStatistics() {
  const { workoutId } = useParams();
  const dispatch = useDispatch();
  const workout = useSelector((state: any) => state.workoutStatistics);

  // 🔹 Загружаем данные тренировки
  const getWorkoutStatistics = async () => {
    if (!workoutId) return;
    const url = `${constants.host}/api/workout/all/info/${workoutId}`;
    try {
      await components.constructorWebAction(
        dispatch,
        constants.workoutStatistics,
        url,
        "GET"
      );
    } catch (err) {
      console.error("Ошибка при загрузке статистики:", err);
    }
  };

  useEffect(() => {
    getWorkoutStatistics();
  }, [workoutId]);

  const workoutData = workout.data ?? {};
  const plannedExercises = workoutData.planned_exercises ?? [];
  const factualExercises = workoutData.factual_exercises ?? [];

  // 🔹 Подсчёт процента выполнения
  const completionPercent = useMemo(() => {
    if (!plannedExercises.length) return 0;

    let completed = 0;
    let total = 0;

    plannedExercises.forEach((pex: any) => {
      const fex = factualExercises.find((fe: any) => fe.name === pex.name);

      pex.approaches.forEach((pa: any, idy: number) => {
        const fa = fex?.approaches[idy] || {};

        const isCompleted =
          (fa.factual_time ?? 0) >= (pa.planned_time ?? 0) &&
          (fa.speed_exercise_equipment ?? 0) >= (pa.speed_exercise_equipment ?? 0) &&
          (fa.weight_exercise_equipment ?? 0) >= (pa.weight_exercise_equipment ?? 0) &&
          (fa.count_approach ?? 0) >= (pa.count_approach ?? 0);

        total++;
        if (isCompleted) completed++;
      });
    });

    return total ? Math.round((completed / total) * 100) : 0;
  }, [plannedExercises, factualExercises]);

  // 🔹 JSX
  return (
    <bases.Base>
      <div className="w-full mt-10 px-4 flex justify-center">
        <div className="flex flex-col gap-y-5 w-full max-w-5xl mt-24">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-6">
            Статистика тренировки:{" "}
            <span className="text-cyan-600">{workoutData.name}</span>{" "}
            <span className="text-lg sm:text-xl">
              от{" "}
              {workoutData.finish_time
                ? new Date(workoutData.finish_time).toLocaleDateString("ru-RU")
                : "-"}
            </span>
          </h1>

          <h1 className="text-lg sm:text-xl font-bold text-slate-100 mb-6">
            Время тренировки:{" "}
            {workoutData.start_time && workoutData.finish_time
              ? `${Math.floor(
                  (new Date(workoutData.finish_time).getTime() -
                    new Date(workoutData.start_time).getTime()) /
                    1000 /
                    60 /
                    60
                )} ч ${Math.floor(
                  ((new Date(workoutData.finish_time).getTime() -
                    new Date(workoutData.start_time).getTime()) /
                    1000 /
                    60) %
                    60
                )} мин`
              : "-"}
          </h1>

          <h1 className="text-lg sm:text-xl font-bold text-slate-100 mb-6">
            Тренировка выполнена на{" "}
            <span className="text-cyan-500">{completionPercent}%</span>
          </h1>

          {plannedExercises.length === 0 && (
            <p className="text-slate-200 text-center">
              Нет данных для этой тренировки
            </p>
          )}

          {plannedExercises.length > 0 && (
            <div className="flex flex-col gap-6">
              {plannedExercises.map((pex: any, idx: number) => {
                const fex = factualExercises.find(
                  (fe: any) => fe.name === pex.name
                );

                return (
                  <div
                    key={idx}
                    className="flex flex-col rounded-2xl bg-white shadow-md overflow-hidden p-4"
                  >
                    <h2 className="font-bold text-lg sm:text-xl mb-3 text-slate-800">
                      {pex.name}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pex.approaches.map((pa: any, idy: number) => {
                        const fa = fex?.approaches[idy] || {};

                        const completed =
                          (fa.factual_time ?? 0) >= (pa.planned_time ?? 0) &&
                          (fa.speed_exercise_equipment ?? 0) >=
                            (pa.speed_exercise_equipment ?? 0) &&
                          (fa.weight_exercise_equipment ?? 0) >=
                            (pa.weight_exercise_equipment ?? 0) &&
                          (fa.count_approach ?? 0) >=
                            (pa.count_approach ?? 0);

                        return (
                          <div
                            key={idy}
                            className="flex justify-between items-center p-2 bg-slate-100 rounded-lg"
                          >
                            <div className="flex flex-col">
                              <p className="font-bold">Подход {idy + 1}</p>
                              <p>
                                План:
                                {pa.planned_time
                                  ? ` Время: ${pa.planned_time / 60} мин,`
                                  : ""}{" "}
                                {pa.speed_exercise_equipment
                                  ? ` Скорость: ${pa.speed_exercise_equipment} км/ч,`
                                  : ""}{" "}
                                {pa.weight_exercise_equipment
                                  ? ` Вес: ${pa.weight_exercise_equipment} кг,`
                                  : ""}{" "}
                                {pa.count_approach
                                  ? ` Повторения: ${pa.count_approach} раз`
                                  : ""}
                              </p>
                              <p>
                                Факт:
                                {fa.factual_time
                                  ? ` Время: ${fa.factual_time / 60} мин,`
                                  : pa.factual_time ? " Время: 0 мин,":""}
                                {fa.speed_exercise_equipment 
                                  ? ` Скорость: ${fa.speed_exercise_equipment} км/ч,`
                                  : pa.speed_exercise_equipment ? " Скорость: 0 км/ч,":""}
                                {fa.weight_exercise_equipment
                                  ? ` Вес: ${fa.weight_exercise_equipment} кг,`
                                  : pa.weight_exercise_equipment ? " Вес: 0 кг,":""}
                                {fa.count_approach
                                  ? ` Повторения: ${fa.count_approach} раз`
                                  : pa.count_approach ? " Повторения: 0 раз":""}
                              </p>
                            </div>
                            <div className="text-2xl text-slate-800">
                              {completed ? (
                                <i className="fa-solid fa-check text-cyan-600"></i>
                              ) : (
                                <i className="fa-solid fa-xmark text-cyan-600"></i>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </bases.Base>
  );
}
