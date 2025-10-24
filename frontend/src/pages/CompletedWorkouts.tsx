import { useUser } from "../components/profile";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";  
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";
import axios from "axios";
import * as utils from "../components/utils";

const PAGE_SIZE = 9;

export default function Page() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const { userId } = useParams();
  const navigate = useNavigate();
  const workout = useSelector((state: any) => state.workoutFinishList);
  const workoutIdState = useSelector((state: any) => state.workoutId?.data);

  const [currentPage, setCurrentPage] = useState(1);

  // Получение завершённых тренировок с сервера
  const getWorkout = async (page: number = 1) => {
    if (!user) return;
    const url = `${constants.host}/api/all/workouts/planned/user/${userId}/0?page=${page}&page_size=${PAGE_SIZE}`;
    try {
      await components.constructorWebAction(dispatch, constants.workoutFinishList, url, "GET");
    } catch (err) {
      console.error("Ошибка при загрузке тренировок:", err);
    }
  };

  useEffect(() => {
    getWorkout(currentPage);
  }, [user, currentPage]);

 const handleRepeatWorkout = async (workout_id: number) => {
  const url = `${constants.host}/api/workout/repeat/planned/info/${user.user_id}/${workout_id}`;
  
  try {
    const token = utils.LocalStorage.get("userLogin.data.access");
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Sasha ${token}`, 
      },
    });

    const stateData = response.data; 

    if (stateData?.data?.workout_id) {
      navigate(`/workouts/training/${stateData.data.workout_id}/user/${user.user_id}/`);
    } else {
      console.error("Не удалось получить новый workout_id:", stateData);
    }
  } catch (err) {
    console.error("Ошибка при повторении тренировки:", err);
  }
};


  const workoutResults = workout?.data?.results ?? [];
  const totalPages = workout?.data?.total_pages ?? 1;
  const hasWorkouts = workoutResults.length > 0;

  return (
    <bases.Base>
      <div className="w-full mt-10 px-4 flex justify-center">
        <div className="flex flex-col gap-y-5 w-full max-w-5xl mt-24 ">
          <h1 className="text-2xl sm:text-3xl font-bold leading-9 tracking-tight text-slate-100 mb-6 flex">
            Завершённые тренировки:
            {workout.load && (
              <div className="ml-3 w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h1>

          {!hasWorkouts && !workout.load && user && (
            user.user_id == userId ? (
            <p className="w-full text-base sm:text-lg text-slate-200 text-center sm:text-left">
              У вас пока нет завершённых тренировок
            </p>
            ):(
              <p className="w-full text-base sm:text-lg text-slate-200 text-center sm:text-left">
              У друга пока нет завершённых тренировок
            </p>
            )
          )}

          {hasWorkouts && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {workoutResults.map((item: any) => (
                  <div key={item.id} className="flex flex-col rounded-2xl bg-white shadow-md overflow-hidden">
                    <img
                      src={`${constants.host}${item.avatar}`}
                      alt={`fitness-${item.id}`}
                      className="w-full h-40 object-cover"
                    />

                    <div className="flex flex-col items-center text-center gap-y-4 p-4 text-slate-800">
                      <h1 className="font-bold text-lg sm:text-xl leading-7 tracking-tight">
                        {item.name} <br />
                        <span className="text-sm text-slate-400">
                          {item.finish_time ? new Date(item.finish_time).toLocaleDateString("ru-RU") : "—"}
                        </span>
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

                      <div className="w-3/4 flex flex-col gap-2">
                        <Link to={`/workouts/workout-statistics/${item.id}`} className="w-full">
                          <div className="flex justify-center bg-cyan-600 hover:bg-slate-100 rounded-3xl transition">
                            <h1 className="p-2 text-sm sm:text-m font-bold leading-7 tracking-tight text-slate-100 hover:text-cyan-600">
                              Посмотреть результаты
                            </h1>
                          </div>
                        </Link>

                        <button
                          onClick={() => handleRepeatWorkout(item.id)}
                          className="w-full flex justify-center bg-cyan-600 hover:bg-slate-100 rounded-3xl transition"
                        >
                          <h1 className="p-2 text-sm sm:text-m font-bold leading-7 tracking-tight text-slate-100 hover:text-cyan-600">
                            Повторить тренировку
                          </h1>
                        </button>
                      </div>
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
                      className={`px-3 py-1 rounded-md ${currentPage === idx + 1 ? "bg-cyan-600 text-white" : "bg-slate-200 text-slate-800"}`}
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
