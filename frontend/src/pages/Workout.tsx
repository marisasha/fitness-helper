import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function WorkoutPage() {
  const { workoutId, userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const plan = useSelector((state: any) => state.workoutPlan.data);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [doneData, setDoneData] = useState<any[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentApproachIndex, setCurrentApproachIndex] = useState(0);

  // Загружаем план
  useEffect(() => {
    if (workoutId && userId) {
      components.constructorWebAction(
        dispatch,
        constants.workoutPlan,
        `${constants.host}/api/workout/planned/info/${workoutId}`,
        "GET"
      );
    }
  }, [workoutId, userId, dispatch]);

  // Подготавливаем doneData
  useEffect(() => {
    if (plan?.exercises) {
      setDoneData(
        plan.exercises.map((ex: any) => ({
          name: ex.name,
          approaches: ex.approaches.map((ap: any) => ({
            factual_time: ap.planned_time !== null ? null : null,
            speed_exercise_equipment: ap.speed_exercise_equipment !== null ? null : null,
            weight_exercise_equipment: ap.weight_exercise_equipment !== null ? null : null,
            count_approach: ap.count_approach !== null ? null : null,
          })),
        }))
      );
    }
  }, [plan]);

  // Таймер
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted]);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function updateDoneApproach(
    exIndex: number,
    apIndex: number,
    field: string,
    value: number | null
  ) {
    const updated = [...doneData];
    updated[exIndex].approaches[apIndex][field] = value;
    setDoneData(updated);
  }

  // Завершение тренировки
  async function finishWorkout() {
    try {
      if (!startTime) {
        alert("Ошибка: время начала не установлено");
        return;
      }

      const finishTime = new Date();

      const payload = {
        workout_id: Number(workoutId),
        start_time: startTime.toISOString(),
        finish_time: finishTime.toISOString(),
        exercises: doneData.map((ex) => ({
          name: ex.name,
          // @ts-ignore
          approaches: ex.approaches.map((ap) => ({
            factual_time: ap.factual_time ?? null,
            speed_exercise_equipment: ap.speed_exercise_equipment ?? null,
            weight_exercise_equipment: ap.weight_exercise_equipment ?? null,
            count_approach: ap.count_approach ?? null,
          })),
        })),
      };
      await components.constructorWebAction(
        dispatch,
        constants.workoutFinish,
        `${constants.host}/api/input/workout/data`,
        "POST",
        {},
        payload
      );

      alert("✅ Тренировка завершена и сохранена!");
      navigate("/workouts");
    } catch (error) {
      console.error("Ошибка при сохранении данных:", error);
      alert("Ошибка при сохранении данных о тренировке");
    }
  }

  if (!plan) {
    return (
      <bases.Base>
        <div className="p-5 text-center text-lg">Загрузка плана тренировки...</div>
      </bases.Base>
    );
  }

  const currentExercise = plan.exercises?.[currentExerciseIndex] ?? { approaches: [], name: "" };
  const currentApproachPlan = currentExercise.approaches?.[currentApproachIndex] ?? {};

  const currentApproachDone =
    doneData[currentExerciseIndex]?.approaches?.[currentApproachIndex] ?? {
      factual_time: null,
      speed_exercise_equipment: null,
      weight_exercise_equipment: null,
      count_approach: null,
    };

  return (
    <bases.Base>
      <div className="w-full mt-20">
        <div className="m-auto flex flex-col gap-y-5 w-full max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-end justify-center text-l font-semibold leading-6 text-cyan-600 hover:text-gray-600">
              <span className="text-5xl">Fitnes</span>
              <span className="text-white">helper</span>
            </div>
            <h1 className="text-3xl text-center font-bold text-slate-100">
              {plan.name}
            </h1>
            <h2 className="w-3/12 p-1 text-lg text-center bg-yellow-400 text-slate-100 rounded-lg">
              {plan.type}
            </h2>
          </div>

          {/* Блок упражнения */}
          <div className=" p-6 rounded-2xl bg-slate-100 shadow-lg space-y-6 text-black">
            <div className="flex justify-between">
              <button
                disabled={currentExerciseIndex === 0}
                onClick={() => {
                  setCurrentExerciseIndex((i) => i - 1);
                  setCurrentApproachIndex(0);
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 "
              >
                <i className="fa-slab fa-regular fa-arrow-left fa-xl" style={{ color: '#ffffffff' }}></i>
              </button>
              <span className="text-2xl font-semibold text-center">
                  Упражнение {currentExerciseIndex + 1}: {currentExercise.name}
              </span>
              <button
                disabled={currentExerciseIndex === plan.exercises.length - 1}
                onClick={() => {
                  setCurrentExerciseIndex((i) => i + 1);
                  setCurrentApproachIndex(0);
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 "
              >
                <i className="fa-slab fa-regular fa-arrow-right fa-xl" style={{ color: '#ffffffff' }}></i>
              </button>
            </div>

            {/* Запланировано */}
            <div className=" rounded-xl w-3/6 p-4 pl-2 text-left text-lg space-y-1  border-2 border-cyan-600">
              <h4 className="font-semibold mb-1 text-xl text-cyan-600">Цель:</h4>
              {currentApproachPlan.planned_time !== null && (
                <div className="pl-2"> Время:  {currentApproachPlan.planned_time / 60} мин</div>
              )}
              {currentApproachPlan.speed_exercise_equipment !== null && (
                <div className="pl-2">Скорость:  {currentApproachPlan.speed_exercise_equipment} км/ч</div>
              )}
              {currentApproachPlan.weight_exercise_equipment !== null && (
                <div className="pl-2">Вес:  {currentApproachPlan.weight_exercise_equipment} кг</div>
              )}
              {currentApproachPlan.count_approach !== null && (
                <div className="pl-2">Повторения:  {currentApproachPlan.count_approach} раз</div>
              )}
            </div>

            {/* Фактически */}
            <div className="flex flex-col items-center w-full">

              <div className="flex flex-col gap-4 w-full">
                {currentApproachPlan.planned_time !== null && (
                  <NumericInput
                    value={
                      currentApproachDone.factual_time !== null
                        ? currentApproachDone.factual_time / 60
                        : null
                    }
                    min={1}
                    onChange={(val) =>
                      updateDoneApproach(
                        currentExerciseIndex,
                        currentApproachIndex,
                        "factual_time",
                        val === null ? null : val * 60
                      )
                    }
                    placeholder="⏱ Время"
                  />
                )}
                {currentApproachPlan.speed_exercise_equipment !== null && (
                  <NumericInput
                    placeholder="Скорость"
                    value={currentApproachDone?.speed_exercise_equipment ?? null}
                    min={1}
                    onChange={(val) =>
                      updateDoneApproach(
                        currentExerciseIndex,
                        currentApproachIndex,
                        "speed_exercise_equipment",
                        val
                      )
                    }
                  />
                )}
                {currentApproachPlan.weight_exercise_equipment !== null && (
                  <NumericInput
                    placeholder="Вес"
                    value={currentApproachDone?.weight_exercise_equipment ?? null}
                    min={1}
                    onChange={(val) =>
                      updateDoneApproach(
                        currentExerciseIndex,
                        currentApproachIndex,
                        "weight_exercise_equipment",
                        val
                      )
                    }
                  />
                )}
                {currentApproachPlan.count_approach !== null && (
                  <NumericInput
                    placeholder="Повторения"
                    value={currentApproachDone?.count_approach ?? null}
                    min={1}
                    onChange={(val) =>
                      updateDoneApproach(
                        currentExerciseIndex,
                        currentApproachIndex,
                        "count_approach",
                        val
                      )
                    }
                  />
                )}
              </div>

              {/* Навигация по подходам */}
              <div className="flex justify-between items-center gap-5 mt-4">
                <button
                  disabled={currentApproachIndex === 0}
                  onClick={() => setCurrentApproachIndex((i) => i - 1)}
                  className="p-3 py-1 rounded-lg bg-cyan-600 cyan-blocks"
                >
                  <i className="fa-slab fa-regular fa-arrow-left fa-xl " ></i>
                </button>
                <span>
                  Подход {currentApproachIndex + 1} из {currentExercise.approaches.length}
                </span>
                <button
                  disabled={currentApproachIndex === currentExercise.approaches.length - 1}
                  onClick={() => setCurrentApproachIndex((i) => i + 1)}
                  className="p-3 py-1 rounded-lg lg bg-cyan-600 cyan-blocks"
                >
                  <i className="fa-slab fa-regular fa-arrow-right fa-xl "></i>
                </button>
              </div>
          <div className="w-full flex justify-between items-center mt-20 ">
            {!isStarted ? (
              <button
                onClick={() => {
                  setIsStarted(true);
                  setStartTime(new Date());
                }}
                className="text-lg bg-cyan-600 text-slate-100 px-5 py-3 rounded-2xl hover:bg-slate-100 hover:text-cyan-600 border-2 border-slate-100 hover:border-cyan-600"
              >
                ▶️ Начать тренировку
              </button>
            ) : (
              <>
                <button
                  onClick={finishWorkout}
                  className="text-lg bg-red-600 text-slate-100 px-5 py-3 rounded-2xl hover:bg-slate-100 hover:text-red-600 border-2 border-slate-100 hover:border-red-600"
                >
                  ⏹ Завершить тренировку
                </button>
                <div className="text-xl text-gray-900">
                  ⏱ {formatTime(seconds)}
                </div>
              </>
            )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </bases.Base>
  );
}

/* Универсальный NumericInput */
function NumericInput({
  value,
  onChange,
  min = 0,
  placeholder
}: {
  value: number | null;
  onChange: (val: number | null) => void;
  min?: number;
  placeholder: string;
}) {
  const stepButtons = [-10, -1, +1, +10];

  return (
    <div className="flex flex-col items-center gap-y-5  text-slate-100 mt-4">
      <div className="flex items-center justify-center gap-2">
        {stepButtons.slice(0, 2).map((step) => (
          <button
            key={step}
            className="w-24 h-24 text-xl rounded-full bg-cyan-600"
            onClick={() => onChange(Math.max(min, (value ?? 0) + step))}
          >
            {step}
          </button>
        ))}
        <input
          type="number"
          min={min}
          className="no-spinner w-1/3 rounded-lg border border-cyan-600 bg-cyan-600 px-3 py-2 text-center text-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Math.max(min, +e.target.value))
          }
          onKeyDown={(e) => {
            if (
              !/[0-9]/.test(e.key) &&
              !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(
                e.key
              )
            ) {
              e.preventDefault();
            }
          }}
          placeholder={placeholder}
        />
        {stepButtons.slice(2).map((step) => (
          <button
            key={step}
            className="w-24 h-24 text-xl rounded-full bg-cyan-600"
            onClick={() => onChange(Math.max(min, (value ?? 0) + step))}
          >
            {step > 0 ? `+${step}` : step}
          </button>
        ))}
      </div>
    </div>
  );
}
