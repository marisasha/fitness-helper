import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Autocomplete, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/profile";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function CreateWorkoutPage() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const workout = useSelector((state: any) => state.workoutList);
  const exercise = useSelector((state: any) => state.userExercises);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  const [plan, setPlan] = useState({
    name: "",
    type: "",
    user: 0,
    exercises: [
      {
        name: "",
        approaches: [
          {
            planned_time: null,
            speed_exercise_equipment: null,
            weight_exercise_equipment: null,
            count_approach: null,
          },
        ],
      },
    ],

  });

  useEffect(() => {
    if (user?.user_id) {
      components.constructorWebAction(
        dispatch,
        constants.userExercises,
        `${constants.host}/api/user/exercises/${user.user_id}`,
        "GET"
      );
      
    }
  }, [dispatch,user]);

  useEffect(() => {
    if (user?.user_id) {
      setPlan((prev) => ({ ...prev, user: user.user_id }));
    }
  }, [user]);

  function addExercise() {
    const newExercise = {
      name: "",
      approaches: [
        {
          planned_time: null,
          speed_exercise_equipment: null,
          weight_exercise_equipment: null,
          count_approach: null,
        },
      ],
    };
    setPlan((prev) => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
    setCurrentExerciseIndex(plan.exercises.length);
  }

  function deleteExercise(index: number) {
    if (plan.exercises.length === 1) return;
    const updated = plan.exercises.filter((_, i) => i !== index);
    setPlan({ ...plan, exercises: updated });
    setCurrentExerciseIndex(updated.length ? 0 : 0);
  }

  function updateExercise(field: string, value: any) {
    const updated = [...plan.exercises];
    // @ts-ignore
    updated[currentExerciseIndex][field] = value;
    setPlan({ ...plan, exercises: updated });
  }

  function updateApproach(idx: number, field: string, value: any) {
    const updated = [...plan.exercises];
    if (field === "planned_time") {
      // @ts-ignore
      updated[currentExerciseIndex].approaches[idx][field] =
      value === null ? null : value * 60;
    } else {
      // @ts-ignore
      updated[currentExerciseIndex].approaches[idx][field] = value;
    }
    setPlan({ ...plan, exercises: updated });
  }

  function addApproach() {
    const updated = [...plan.exercises];
    updated[currentExerciseIndex].approaches.push({
      planned_time: null,
      speed_exercise_equipment: null,
      weight_exercise_equipment: null,
      count_approach: null,
    });
    setPlan({ ...plan, exercises: updated });
  }

  async function savePlan() {
    if (!user?.user_id) return;

    if (!plan.name.trim()) {
      alert("Введите название тренировки");
      return;
    }
    if (!plan.type.trim()) {
      alert("Выберите тип тренировки");
      return;
    }
    for (let i = 0; i < plan.exercises.length; i++) {
      if (!plan.exercises[i].name.trim()) {
        alert(`Введите название для упражнения №${i + 1}`);
        return;
      }
    }

    try {
      await components.constructorWebAction(
        dispatch,
        constants.workoutList,
        `${constants.host}/api/create/workout`,
        "POST",
        {},
        plan
      );
      alert("План успешно создан!");
      navigate("/workouts");
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      alert("Ошибка при создании плана");
      navigate("/workouts");
    }
  }
  const exerciseOptions = exercise.data ? exercise.data.map((ex: any) => ex.name) : []
  
  if (!user) {
    return (
      <bases.Base>
        <div className="p-5">
          <h1 className="text-xl font-bold">Профиль</h1>
          <p>Вы не авторизованы</p>
        </div>
      </bases.Base>
    );
  }

  return (
    <bases.Base>
      <div className="w-full mt-8 px-4 flex justify-center">
        <div className="flex flex-col gap-y-5 w-full max-w-3xl mt-20">
          <h1 className="text-2xl sm:text-3xl text-center font-bold leading-9 tracking-tight text-slate-100">
            Заполните план тренировки
          </h1>

          {/* Основные поля */}
          <input
            className="border p-3 w-full rounded-lg"
            placeholder="Название тренировки"
            value={plan.name}
            onChange={(e) => {
              if (e.target.value.length <= 20) {
                setPlan({ ...plan, name: e.target.value });
              }
            }}
            required
          />
          <select
            className="border h-12 w-full rounded-lg"
            value={plan.type}
            onChange={(e) => setPlan({ ...plan, type: e.target.value })}
            required
          >
            <option value="">Выберите тип тренировки</option>
            <option value="Силовая">Силовая</option>
            <option value="Функциональная">Функциональная</option>
            <option value="Кардио">Кардио</option>
            <option value="Растяжка">Растяжка</option>
            <option value="Смешанная">Смешанная</option>
          </select>

          {/* Блок упражнения */}
          {currentExerciseIndex !== null && (
            <div className="border p-4 rounded-2xl bg-white shadow space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg font-semibold">
                  Упражнение {currentExerciseIndex + 1}
                </h2>
                <div className="flex flex-row gap-2">
                  <button
                    className="bg-red-500 text-slate-100 rounded-lg px-3 py-2 text-sm hover:bg-white hover:text-red-500 border-2 border-red-500 hover:border-red-500"
                    onClick={() => deleteExercise(currentExerciseIndex)}
                  >
                    Удалить
                  </button>
                  <button
                    className="bg-cyan-600 rounded-lg px-3 py-2 text-sm cyan-blocks"
                    onClick={addApproach}
                  >
                    + Подход
                  </button>
                  <button
                    className="bg-cyan-600 rounded-lg px-3 py-2 text-sm cyan-blocks"
                    onClick={addExercise}
                  >
                    + Упражнение
                  </button>
                </div>
              </div>

              <Autocomplete
                freeSolo
                options={exerciseOptions} 
                value={plan.exercises[currentExerciseIndex]?.name || ""}
                onChange={(event, newValue) => updateExercise("name", newValue)}
                onInputChange={(event, newInputValue) => updateExercise("name", newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Название упражнения"
                    variant="outlined"
                    className="w-full"
                  />
                )}
              />

              {/* Подходы */}
              <div className="mt-2 space-y-3">
                {plan.exercises[currentExerciseIndex].approaches.map((ap, idx) => (
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Время */}
                      <NumericInput
                        value={
                          ap.planned_time === null ? null : ap.planned_time / 60
                        }
                        placeholder="Время"
                        onChange={(val) => updateApproach(idx, "planned_time", val)}
                        min={0}
                      />
                    {/* Скорость */}
      
                      <NumericInput
                        value={ap.speed_exercise_equipment}
                        placeholder="Скорость"
                        onChange={(val) =>
                          updateApproach(idx, "speed_exercise_equipment", val)
                        }
                        min={0}
                      />


                    {/* Вес */}

                      <NumericInput
                        value={ap.weight_exercise_equipment}
                        placeholder="Вес"
                        onChange={(val) =>
                          updateApproach(idx, "weight_exercise_equipment", val)
                        }
                        min={0}
                      />
                    {/* Повторения */}
                      <NumericInput
                        value={ap.count_approach}
                        placeholder="Повторения"
                        onChange={(val) =>
                          updateApproach(idx, "count_approach", val)
                        }
                        min={0}
                      />
                    </div>
                ))}
              </div>

              {/* Навигация */}
              <div className="flex justify-between mt-3">
                <button
                  disabled={currentExerciseIndex === 0}
                  onClick={() => setCurrentExerciseIndex((i) => i - 1)}
                  className="px-3 py-2 rounded-lg bg-cyan-600 cyan-blocks"
                >
                  <i className="fa-slab fa-regular fa-arrow-left fa-xl " ></i>
                </button>
                <button
                  disabled={currentExerciseIndex === plan.exercises.length - 1}
                  onClick={() => setCurrentExerciseIndex((i) => i + 1)}
                  className="px-3 py-2 rounded-lg bg-cyan-600 cyan-blocks"
                >
                  <i className="fa-slab fa-regular fa-arrow-right fa-xl " ></i>
                </button>
              </div>
            </div>
          )}

          {/* Сохранить */}
          <button
            onClick={savePlan}
            className="text-lg bg-cyan-600 text-slate-100 px-5 py-3 rounded-2xl hover:bg-slate-100 hover:text-cyan-600 border-3 border-cyan-600 hover:border-cyan-600"
          >
            Сохранить план
          </button>
        </div>
      </div>
    </bases.Base>
  );
}

/* Новый компонент NumericInput */
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
      className="no-spinner border p-2 rounded-lg w-full"
      placeholder={placeholder}
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
    />
  );
}
