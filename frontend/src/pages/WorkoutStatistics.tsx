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

  // 🔹 Объединяем плановые и внеплановые упражнения
  const allExercises = useMemo(() => {
    const result = [...plannedExercises];
    
    // Добавляем внеплановые упражнения
    factualExercises.forEach((fex: any) => {
      const isPlanned = plannedExercises.some((pex: any) => pex.name === fex.name);
      if (!isPlanned) {
        result.push({
          name: fex.name,
          approaches: fex.approaches,
          isCustom: true // помечаем как внеплановое
        });
      }
    });
    
    return result;
  }, [plannedExercises, factualExercises]);

  // 🔹 Подсчёт процента выполнения (только для плановых упражнений)
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

  // 🔹 Функция для форматирования данных подхода
  const renderApproachData = (approach: any) => {
    const parts = [];
    
    if (approach.factual_time !== null && approach.factual_time !== undefined) {
      parts.push(`Время: ${approach.factual_time / 60} мин`);
    }
    
    if (approach.speed_exercise_equipment !== null && approach.speed_exercise_equipment !== undefined) {
      parts.push(`Скорость: ${approach.speed_exercise_equipment} км/ч`);
    }
    
    if (approach.weight_exercise_equipment !== null && approach.weight_exercise_equipment !== undefined) {
      parts.push(`Вес: ${approach.weight_exercise_equipment} кг`);
    }
    
    if (approach.count_approach !== null && approach.count_approach !== undefined) {
      parts.push(`Повторения: ${approach.count_approach} раз`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Нет данных';
  };

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
            План выполнен на{" "}
            <span className="text-cyan-500">{completionPercent}%</span>
          </h1>

          {allExercises.length === 0 && (
            <p className="text-slate-200 text-center">
              Нет данных для этой тренировки
            </p>
          )}

          {allExercises.length > 0 && (
            <div className="flex flex-col gap-6">
              {allExercises.map((ex: any, idx: number) => {
                const isCustomExercise = ex.isCustom;
                const fex = factualExercises.find(
                  (fe: any) => fe.name === ex.name
                );

                return (
                  <div
                    key={idx}
                    className="flex flex-col rounded-2xl bg-white shadow-md overflow-hidden p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="font-bold text-lg sm:text-xl text-slate-800">
                        {isCustomExercise ? "Внеплановое упражнение" : "Упражнение"}: {ex.name}
                      </h2>
                      {isCustomExercise && (
                        <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full">
                          доп.
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Плановые подходы */}
                      {!isCustomExercise && ex.approaches.map((pa: any, idy: number) => {
                        const fa = fex?.approaches?.[idy] || {};

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
                            className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border-l-4 border-cyan-600"
                          >
                            <div className="flex flex-col flex-1">
                              <p className="font-bold text-slate-800">Подход {idy + 1}</p>
                              <div className="mt-2">
                                <p className="text-sm text-slate-600">
                                  <span className="font-semibold">План:</span>{" "}
                                  {renderApproachData(pa)}
                                </p>
                                <p className="text-sm text-slate-800 mt-1">
                                  <span className="font-semibold">Факт:</span>{" "}
                                  {renderApproachData(fa)}
                                </p>
                              </div>
                            </div>
                            <div className="text-2xl ml-3">
                              {completed ? (
                                <i className="fa-solid fa-check text-green-600"></i>
                              ) : (
                                <i className="fa-solid fa-xmark text-red-600"></i>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Внеплановые подходы для плановых упражнений */}
                      {!isCustomExercise && fex && fex.approaches && fex.approaches.length > ex.approaches.length && 
                        fex.approaches.slice(ex.approaches.length).map((fa: any, idy: number) => {
                          const approachIndex = ex.approaches.length + idy;
                          
                          return (
                            <div
                              key={`custom-${idy}`}
                              className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border-l-4 border-orange-500"
                            >
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-800">
                                    Внеплановый подход {approachIndex + 1}
                                  </p>
                                  <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                                    доп.
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-slate-800">
                                    <span className="font-semibold">Факт:</span>{" "}
                                    {renderApproachData(fa)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-2xl ml-3 text-orange-500">
                                <i className="fa-solid fa-plus"></i>
                              </div>
                            </div>
                          );
                        })
                      }

                      {/* Подходы для внеплановых упражнений */}
                      {isCustomExercise && ex.approaches.map((fa: any, idy: number) => (
                        <div
                          key={idy}
                          className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border-l-4 border-orange-500"
                        >
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800">
                                Внеплановый подход {idy + 1}
                              </p>
                              <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                                доп.
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-slate-800">
                                <span className="font-semibold">Факт:</span>{" "}
                                {renderApproachData(fa)}
                              </p>
                            </div>
                          </div>
                          <div className="text-2xl ml-3 text-orange-500">
                            <i className="fa-solid fa-plus"></i>
                          </div>
                        </div>
                      ))}
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