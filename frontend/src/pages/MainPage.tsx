import { useUser } from "../components/profile";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as bases from "../components/bases";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import * as components from "../components/components";
import * as constants from "../components/constants";
import { store } from "../components/store"; 

export default function Page() {
  const user: any = useUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const purpose = useSelector((state: any) => state.workoutPurpose);
  const profile = useSelector((state: any) => state.userName);
  const recomendedWorkouts = useSelector((state: any) => state.workoutListRecommended);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPurpose, setNewPurpose] = useState<number | null>(null);
  const now = new Date();
  const monthName = now.toLocaleString("ru-RU", { month: "long" });
  
  const fetchPurpose = async () => {
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

  
  const createPurpose = async () => {
    if (!user || !newPurpose) return;
    
    const start_time = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    const finish_time = endDate.toISOString();
    
    const body = { start_time, finish_time, purpose: newPurpose };
    const url = `${constants.host}/api/create/workouts/purpose/${user.user_id}`;
    
    try {
      await components.constructorWebAction(
        dispatch,
        constants.workoutPurpose,
        url,
        "POST",
        {},
        body
      );
      
      await fetchPurpose();
      setShowCreateForm(false);
    } catch (err) {
      console.error("Ошибка при создании цели:", err);
    }
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return "Доброе утро , ";
    if (hour >= 12 && hour < 18) return "Добрый день , ";
    if (hour >= 18 && hour < 23) return "Добрый вечер , ";
    return "Доброй ночи , ";
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
    fetchPurpose();
    getName();
    getRecommendedWorkouts()
  }, [user]);

  const hasWorkouts = recomendedWorkouts?.data && recomendedWorkouts.data.length > 0;

  return (
    <bases.Base>
      <div className="flex flex-col w-full mt-10">

        <div className="p-4 flex flex-col md:flex-row w-full justify-between items-start text-3xl md:text-5xl items-center md:items-start">
          
          {profile?.data && !profile.load && (

            <div className="flex gap-x-5">
              <h1 className=" text-slate-100 font-bold animate-fade-in">
                {getGreeting()}
              </h1>
                <h1 className="text-slate-100 font-bold animate-fade-in">
                  {profile.data} !
                </h1>
            </div>

            )}


          <div className="flex justify-center md:justify-end items-center w-full md:w-1/2 mt-6 md:mt-0">
            {purpose.data && !purpose.load && (

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
                <div className="flex items-end text-lg font-semibold leading-6 justify-center mt-3">
                  <span className="text-5xl text-cyan-600 hover:text-gray-600">Fitnes</span>
                  <span className="text-gray-600 hover:text-cyan-600">helper</span>
                </div>

              </div>
            )}

            {!purpose.data && !purpose.load && !showCreateForm && (
              <div className="w-full sm:w-60 flex justify-center p-3 text-center bg-cyan-600 hover:bg-slate-100 rounded-3xl transition">

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="text-lg sm:text-xl font-bold leading-9 tracking-tight text-slate-100 hover:text-cyan-600"
                >
                  Добавить цель посещений на {monthName}
                </button>

              </div>
            )}

            {showCreateForm && (
              <div className="flex flex-col gap-y-5 bg-white shadow-md rounded-2xl p-4 text-center">

                <div className="flex gap-x-5 items-center">
                  <h3 className="font-semibold text-lg">
                    Цель посещений на {monthName}
                  </h3>
                  <div className="flex gap-x-3">
                    <button
                      onClick={createPurpose}
                      className="bg-cyan-600 text-slate-100 px-3 py-1 rounded-lg hover:bg-slate-100 hover:text-cyan-600"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="bg-cyan-600 text-slate-100 px-4 py-1 rounded-lg hover:bg-slate-100 hover:text-cyan-600"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
                <NumericInput
                  value={newPurpose}
                  placeholder="Количество дней"
                  onChange={setNewPurpose}
                  min={1}
                />

              </div>
            )}

            {purpose.error && !purpose.load && (
              <p className="text-red-500 text-sm mt-3">Ошибка загрузки данных</p>
            )}
          </div>
        </div>

        {hasWorkouts && (
          <div className="flex flex-col mt-7">
            <h1 className="text-2xl md:text-4xl text-slate-100 font-semibold ml-16">Попробуй эти тренировки 🔥:</h1>
            <div className=" overflow-x-auto scrollbar-thin ">
            <div className="flex gap-4 px-4 mt-3">
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
                    <h1 className="font-bold text-base leading-5 tracking-tight">
                      {item.name}
                    </h1>
                    <div className="flex gap-x-3 items-center font-semibold">
                      <p className="text-xs text-gray-600">
                        Упражнений: {item.exercises_count}
                      </p>
                      <span className="text-[10px] bg-yellow-400 border rounded-lg px-2 py-0.5">
                        {item.type ?? "Тип не указан"}
                      </span>
                    </div>
                    <button
                        className="mt-2 flex justify-center bg-cyan-600 hover:bg-slate-100 rounded-2xl transition text-slate-100 hover:text-cyan-600"
                        onClick={() => handleRepeatWorkout(item.id)}
                      >
                        <h1 className="px-10 py-2 text-xs font-bold ">
                          Начать
                        </h1>
                      </button>
                  </div>
                </div>
              ))}
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
      className="no-spinner border p-2 rounded-lg w-full text-center"
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
