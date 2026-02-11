import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Autocomplete, TextField } from "@mui/material";
import { useUser } from "../components/profile";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function WorkoutPage() {
  const { workoutId, userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user: any = useUser();

  const plan = useSelector((state: any) => state.workoutPlan.data) ?? {};
  const exercise = useSelector((state: any) => state.userExercises);
  const [activeWorkoutData, setActiveWorkoutData] = useState<any>(null);
  const [activeWorkoutLoading, setActiveWorkoutLoading] = useState(false);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentApproachIndex, setCurrentApproachIndex] = useState(0);
  const [doneData, setDoneData] = useState<any[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseFields, setNewExerciseFields] = useState({
    time: false,
    speed: false,
    weight: false,
    count: false,
  });

  const getPlan = async () => {
    if (workoutId && userId) {
      const url = `${constants.host}/api/workout/planned/info/${workoutId}`;
      await components.constructorWebAction(dispatch, constants.workoutPlan, url, "GET");
    }
  };

  useEffect(() => {
      if (user?.user_id) {
        components.constructorWebAction(
          dispatch,
          constants.userExercises,
          `${constants.host}/api/user/exercises/${user.user_id}`,
          "GET"
        );
        
      }
    }, [user]);

  async function loadActiveWorkoutDirect() {
    if (!workoutId) return;

    try {
      setActiveWorkoutLoading(true);
      const res = await fetch(`${constants.host}/api/workout/active/info/${workoutId}/`);
      const result = await res.json();
      const data = result.data ?? result;

      if (!data?.start_time) {
        setActiveWorkoutData(null);
        setIsStarted(false);
        setStartTime(null);
        setSeconds(0);
        setDoneData([]);
        return;
      }

      setActiveWorkoutData(data);
      setDoneData(data.exercises ?? []);

      const restoredStart = new Date(data.start_time);
      setStartTime(restoredStart);
      setIsStarted(true);
      setSeconds(Math.floor((Date.now() - restoredStart.getTime()) / 1000));
    } catch (err) {
      console.error("Ошибка загрузки активной тренировки", err);
    } finally {
      setActiveWorkoutLoading(false);
    }
  }

  async function startWorkout() {
    if (!workoutId) return;
    const start = new Date();

    await components.constructorWebAction(
      dispatch,
      constants.workoutStart,
      `${constants.host}/api/input/workout/data`,
      "POST",
      {},
      {
        workout_id: Number(workoutId),
        start_time: start.toISOString(),
        is_active: true,
        exercises: doneData || [],
      }
    );

    await loadActiveWorkoutDirect();
  }

  async function saveAuto() {
    if (!startTime) return;

    await components.constructorWebAction(
      dispatch,
      constants.workoutSave,
      `${constants.host}/api/input/workout/data`,
      "POST",
      {},
      {
        workout_id: Number(workoutId),
        start_time: startTime.toISOString(),
        is_active: true,
        exercises: doneData,
      }
    );
  }

  async function finishWorkout() {
    if (!startTime || isFinishing) return; 
    setIsFinishing(true);

    for (const ex of doneData) {
      for (const ap of ex.approaches) {
        const isFilled = 
          (ap.factual_time !== null && ap.factual_time !== undefined) ||
          (ap.speed_exercise_equipment !== null && ap.speed_exercise_equipment !== undefined) ||
          (ap.weight_exercise_equipment !== null && ap.weight_exercise_equipment !== undefined) ||
          (ap.count_approach !== null && ap.count_approach !== undefined);

        if (!isFilled) {
          alert(`Не все подходы заполнены в упражнении "${ex.name}". Пожалуйста, заполните все данные.`);
          setIsFinishing(false);
          return;
        }
      }
    }

    await components.constructorWebAction(
      dispatch,
      constants.workoutFinish,
      `${constants.host}/api/input/workout/data`,
      "POST",
      {},
      {
        workout_id: Number(workoutId),
        start_time: startTime.toISOString(),
        finish_time: new Date().toISOString(),
        is_active: false,
        exercises: doneData,
      }
    );

    setIsStarted(false);
    alert("Тренировка завершена");
    navigate("/workouts");
  }
  

  useEffect(() => {
    getPlan();
    loadActiveWorkoutDirect();
  }, [workoutId, userId]);

  useEffect(() => {
    const exercises = plan?.exercises ?? [];
    if (!exercises.length || isStarted || doneData.length > 0) return;

    setDoneData(
      exercises.map((ex: any) => ({
        name: ex.name,
        approaches: ex.approaches.map((ap: any) => ({
          factual_time: ap.planned_time !== null ? null : undefined,
          speed_exercise_equipment: ap.speed_exercise_equipment !== null ? null : undefined,
          weight_exercise_equipment: ap.weight_exercise_equipment !== null ? null : undefined,
          count_approach: ap.count_approach !== null ? null : undefined,
        })),
      }))
    );
  }, [plan, isStarted]);

  useEffect(() => {
    setDoneData([]);
    setActiveWorkoutData(null);
    setIsStarted(false);
    setStartTime(null);
    setSeconds(0);
    setCurrentExerciseIndex(0);
    setCurrentApproachIndex(0);
  }, [workoutId]);

  useEffect(() => {
    if (!isStarted || !startTime) return;

    const interval = setInterval(() => {
      setSeconds(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 500);

    return () => clearInterval(interval);
  }, [isStarted, startTime]);

  useEffect(() => {
    if (!isStarted || !startTime) return;

    const interval = setInterval(() => saveAuto(), 60 * 1000);
    return () => clearInterval(interval);
  }, [isStarted, startTime, doneData]);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ========== Работа с упражнениями ==========
  function updateDoneApproach(exIndex: number, apIndex: number, field: string, value: number | null) {
    const updated = [...doneData];
    updated[exIndex].approaches[apIndex][field] = value;
    setDoneData(updated);
  }

  function addApproach() {
    const updated = [...doneData];
    const firstApproach = updated[currentExerciseIndex].approaches[0];
    const newApproach = { ...firstApproach };
    Object.keys(newApproach).forEach(key => newApproach[key] = null);
    updated[currentExerciseIndex].approaches.push(newApproach);
    setDoneData(updated);
    setCurrentApproachIndex(updated[currentExerciseIndex].approaches.length - 1);
  }

  function addExercise() {
    setNewExerciseName("");
    setNewExerciseFields({ time: false, speed: false, weight: false, count: false });
    setShowAddExerciseModal(true);
  }

  function confirmAddExercise() {
    if (!newExerciseName.trim()) { alert("Введите название упражнения"); return; }
    if (!newExerciseFields.time && !newExerciseFields.speed && !newExerciseFields.weight && !newExerciseFields.count) {
      alert("Выберите хотя бы один параметр для отслеживания"); return;
    }

    const newExercise = {
      name: newExerciseName.trim(),
      approaches: [{
        factual_time: null,
        speed_exercise_equipment: null,
        weight_exercise_equipment: null,
        count_approach: null,
      }]
    };
    const updated = [...doneData, newExercise];
    setDoneData(updated);
    setCurrentExerciseIndex(updated.length - 1);
    setCurrentApproachIndex(0);
    setShowAddExerciseModal(false);
  }

  // ========== Сопоставление упражнений по имени ==========
  function normalizeExerciseName(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
  }

  const planExerciseMap = useMemo(() => {
    const map = new Map<string, any>();
    (plan?.exercises ?? []).forEach((ex: any) => {
      map.set(normalizeExerciseName(ex.name), ex);
    });
    return map;
  }, [plan]);

  const currentExercise = doneData[currentExerciseIndex] ?? { approaches: [], name: "" };
  const currentExercisePlan = planExerciseMap.get(normalizeExerciseName(currentExercise.name)) ?? { approaches: [] };
  const currentApproachDone = currentExercise.approaches?.[currentApproachIndex] ?? {};
  const currentApproachPlan = currentExercisePlan.approaches?.[currentApproachIndex] ?? {};
  const isCustomExercise = currentExerciseIndex >= ((plan?.exercises?.length) ?? 0);
  const isCustomApproach = currentApproachIndex >= (currentExercisePlan.approaches?.length ?? 0);
  const showGoalBlock = !isCustomExercise && !isCustomApproach && currentExercisePlan.approaches.length > 0;
  const exerciseOptions = exercise.data ? exercise.data.map((ex: any) => ex.name) : []

  const firstApproach = currentExercise.approaches?.[0] ?? {};
  const showTime = firstApproach.factual_time !== undefined;
  const showSpeed = firstApproach.speed_exercise_equipment !== undefined;
  const showWeight = firstApproach.weight_exercise_equipment !== undefined;
  const showCount = firstApproach.count_approach !== undefined;


  return (
    <bases.Base>
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-black">Добавить упражнение</h3>
            <Autocomplete
              freeSolo
              options={exerciseOptions}
              value={newExerciseName}
              onChange={(event, newValue) => setNewExerciseName(newValue || "")}
              onInputChange={(event, newInputValue) => setNewExerciseName(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Название упражнения"
                  variant="outlined"
                  className="w-full"
                />
              )}
            />
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newExerciseFields.time}
                  onChange={(e) => setNewExerciseFields(prev => ({...prev, time: e.target.checked}))}
                  className="w-5 h-5 text-cyan-600"
                />
                <span className="text-black">Время</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newExerciseFields.speed}
                  onChange={(e) => setNewExerciseFields(prev => ({...prev, speed: e.target.checked}))}
                  className="w-5 h-5 text-cyan-600"
                />
                <span className="text-black">Скорость</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newExerciseFields.weight}
                  onChange={(e) => setNewExerciseFields(prev => ({...prev, weight: e.target.checked}))}
                  className="w-5 h-5 text-cyan-600"
                />
                <span className="text-black">Вес</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newExerciseFields.count}
                  onChange={(e) => setNewExerciseFields(prev => ({...prev, count: e.target.checked}))}
                  className="w-5 h-5 text-cyan-600"
                />
                <span className="text-black">Повторения</span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Отмена
              </button>
              <button
                onClick={confirmAddExercise}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mt-16 md:mt-20">
        <div className="m-auto flex flex-col gap-y-4 md:gap-y-5 w-full max-w-2xl md:max-w-3xl px-2">
          <div className="flex items-center justify-around flex-wrap text-center gap-3">
            <div className="flex items-end justify-center text-sm md:text-lg font-semibold leading-6 text-cyan-600 hover:text-gray-600">
              <span className="text-3xl md:text-5xl">Fitnes</span>
              <span className="text-white">helper</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{plan.name}</h1>
          </div>

          {/* Блок упражнения */}
          <div
            className="w-[95%] md:w-full mx-auto p-4 md:p-6 rounded-2xl bg-slate-100 shadow-lg space-y-5 md:space-y-6 text-black transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              {/* Кнопка назад */}
              <button
                disabled={currentExerciseIndex === 0}
                onClick={() => {
                  setCurrentExerciseIndex((i) => i - 1);
                  setCurrentApproachIndex(0);
                }}
                className="px-3 py-2 md:px-4 md:py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
              >
                <i className="fa-solid fa-arrow-left text-lg md:text-xl text-white"></i>
              </button>

              <span className="text-lg md:text-2xl font-semibold text-center">
                Упражнение {currentExerciseIndex + 1}: {currentExercise.name}
              </span>

              {/* Кнопка вперёд */}
              <button
                disabled={currentExerciseIndex === doneData.length - 1}
                onClick={() => {
                  setCurrentExerciseIndex((i) => i + 1);
                  setCurrentApproachIndex(0);
                }}
                className="px-3 py-2 md:px-4 md:py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
              >
                <i className="fa-solid fa-arrow-right text-lg md:text-xl text-white"></i>
              </button>
            </div>

            {/* Цель - показываем только для плановых упражнений и плановых подходов */}
            {showGoalBlock && (
              <div className="rounded-xl w-full md:w-3/6 p-3 md:p-4 text-left text-sm md:text-lg space-y-1 border-2 border-cyan-600">
                <h4 className="font-semibold mb-1 text-base md:text-xl text-cyan-600">
                  Цель:
                </h4>
                {currentApproachPlan.planned_time !== null && currentApproachPlan.planned_time !== undefined && (
                  <div>Время: {currentApproachPlan.planned_time / 60} мин</div>
                )}
                {currentApproachPlan.speed_exercise_equipment !== null && currentApproachPlan.speed_exercise_equipment !== undefined && (
                  <div>Скорость: {currentApproachPlan.speed_exercise_equipment} км/ч</div>
                )}
                {currentApproachPlan.weight_exercise_equipment !== null && currentApproachPlan.weight_exercise_equipment !== undefined && (
                  <div>Вес: {currentApproachPlan.weight_exercise_equipment} кг</div>
                )}
                {currentApproachPlan.count_approach !== null && currentApproachPlan.count_approach !== undefined && (
                  <div>Повторения: {currentApproachPlan.count_approach} раз</div>
                )}
              </div>
            )}

            {/* Фактические данные */}
            <div className="flex flex-col items-center w-full">
              <div className="flex flex-col gap-3 md:gap-4 w-full">
                {currentApproachPlan.planned_time !== null && currentApproachPlan.planned_time !== undefined && (
                  <NumericInput
                    placeholder="Время (мин)"
                    value={
                      currentApproachDone.factual_time
                        ? currentApproachDone.factual_time / 60
                        : null
                    }
                    onChange={(val) =>
                      updateDoneApproach(
                        currentExerciseIndex,
                        currentApproachIndex,
                        "factual_time",
                        val ? val * 60 : null
                      )
                    }
                  />
                )}
                {showSpeed && currentApproachPlan.speed_exercise_equipment !== null && currentApproachPlan.speed_exercise_equipment !== undefined &&(
                  <NumericInput
                    placeholder="Скорость"
                    value={currentApproachDone.speed_exercise_equipment ?? null}
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
                {showWeight && currentApproachPlan.weight_exercise_equipment !== null  &&(
                  <NumericInput
                    placeholder="Вес"
                    value={currentApproachDone.weight_exercise_equipment ?? null}
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
                {showCount && currentApproachPlan.count_approach !== null  &&(
                  <NumericInput
                    placeholder="Повторения"
                    value={currentApproachDone.count_approach ?? null}
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
              <div className="flex justify-between items-center gap-3 md:gap-5 mt-3 md:mt-4 text-sm md:text-base">
                <button
                  disabled={currentApproachIndex === 0}
                  onClick={() => setCurrentApproachIndex((i) => i - 1)}
                  className="p-2 md:p-3 rounded-lg bg-cyan-600"
                >
                  <i className="fa-solid fa-arrow-left text-white text-lg md:text-xl"></i>
                </button>
                <span>
                  Подход {currentApproachIndex + 1} из{" "}
                  {currentExercise.approaches.length}
                </span>
                <button
                  disabled={
                    currentApproachIndex ===
                    currentExercise.approaches.length - 1
                  }
                  onClick={() => setCurrentApproachIndex((i) => i + 1)}
                  className="p-2 md:p-3 rounded-lg bg-cyan-600"
                >
                  <i className="fa-solid fa-arrow-right text-white text-lg md:text-xl"></i>
                </button>
              </div>

              {/* Кнопки управления тренировкой */}
              <div className="w-full flex flex-col justify-between  mt-10 md:mt-20 gap-4">
                {!isStarted ? (
                  <button
                    onClick={startWorkout}
                    className="text-base md:text-lg bg-cyan-600 text-slate-100 px-4 py-2 md:px-5 md:py-3 rounded-2xl hover:bg-slate-100 hover:text-cyan-600 border-2 border-slate-100 hover:border-cyan-600"
                  >
                    ▶️ Начать
                  </button>
                ) : (
                  <>
                    <div className="flex gap-x-2 justify-center">
                      {(showCount || showWeight || showSpeed || showTime) && (
                        <button
                          onClick={addApproach}
                          className="text-sm md:text-base bg-cyan-600 text-white px-3 py-2 rounded-xl hover:bg-cyan-500"
                        >
                          ➕ Подход
                        </button>
                      )}
                      <button
                        onClick={addExercise}
                        className="text-sm md:text-base bg-cyan-600 text-white px-3 py-2 rounded-xl hover:bg-cyan-500"
                      >
                        ➕ Упражнение
                      </button>
                    </div>
                    
                    <div className="flex gap-x-2 items-center justify-center">
                      <button
                        disabled={activeWorkoutLoading}
                        onClick={loadActiveWorkoutDirect}
                        className="bg-yellow-400 px-3 py-2 text-white rounded-xl disabled:opacity-50 w-2/3 hover:bg-yellow-300"
                      >
                        {activeWorkoutLoading ? "Загрузка..." : "Обновить данные" }
                      </button>
                      {!isFinishing ? (
                      <button
                        onClick={finishWorkout}
                        className="text-base md:text-lg bg-red-600 text-slate-100 px-3 py-2 md:px-5 md:py-3 rounded-2xl hover:bg-slate-100 hover:text-red-600 border-2 border-slate-100 hover:border-red-600"
                      >
                        Завершить
                      </button>
                    ): (
                      <button
                        disabled
                        className="text-base md:text-lg bg-red-600 text-slate-100 px-4 py-2 md:px-5 md:py-3 rounded-2xl hover:bg-slate-100 hover:text-red-600 border-2 border-slate-100 hover:border-red-600"
                      >
                        Завершить
                      </button>
                    )}
                    </div>
                    <div className="text-base md:text-xl text-gray-900 ">
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

function NumericInput({
  value,
  onChange,
  min = 0,
  placeholder,
}: {
  value: number | null;
  onChange: (val: number | null) => void;
  min?: number;
  placeholder: string;
}) {
  const stepButtons = [-10, -1, +1, +10];

  return (
    <div className="flex flex-col items-center gap-y-3 md:gap-y-5 text-slate-100 mt-2 md:mt-4">
      <div className="flex items-center justify-center gap-1 md:gap-2">
        {stepButtons.slice(0, 2).map((step) => (
          <button
            key={step}
            className="w-14 h-14 md:w-24 md:h-24 text-lg md:text-xl rounded-full bg-cyan-600"
            onClick={() => onChange(Math.max(min, (value ?? 0) + step))}
          >
            {step}
          </button>
        ))}

        <input
          type="number"
          min={min}
          className="no-spinner w-20 md:w-1/3 rounded-lg border border-cyan-600 bg-cyan-600 px-2 md:px-3 py-1 md:py-2 text-center text-sm md:text-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Math.max(min, +e.target.value))
          }
          placeholder={placeholder}
        />

        {stepButtons.slice(2).map((step) => (
          <button
            key={step}
            className="w-14 h-14 md:w-24 md:h-24 text-lg md:text-xl rounded-full bg-cyan-600"
            onClick={() => onChange(Math.max(min, (value ?? 0) + step))}
          >
            {step > 0 ? `+${step}` : step}
          </button>
        ))}
      </div>
    </div>
  );
}