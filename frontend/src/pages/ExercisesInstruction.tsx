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
  const exercise = useSelector((state: any) => state.exercisesInstruction);


  const [currentPage, setCurrentPage] = useState(1);

  // Получение завершённых тренировок с сервера
  const getExercise = async (page: number = 1) => {
    if (!user) return;
    const url = `${constants.host}/api/exercises/instructions?page=${page}&page_size=${PAGE_SIZE}`;
    try {
      await components.constructorWebAction(dispatch, constants.exercisesInstruction, url, "GET");
    } catch (err) {
      console.error("Ошибка при загрузке тренировок:", err);
    }
  };

  useEffect(() => {
    getExercise(currentPage);
  }, [user, currentPage]);

  if (!user) return <bases.Base />;

  console.log("Redux exercise state:", exercise);
  const exerciseResults = exercise?.data?.results ?? [];
  const totalPages = exercise?.data?.total_pages ?? 1;
  const hasexercises = exerciseResults.length > 0;

  return (
    <bases.Base>
      <div className="w-full px-4 flex justify-center">
        <div className="flex flex-col gap-y-5 w-full max-w-5xl mt-20">
          <h1 className="text-2xl sm:text-3xl font-bold leading-9 tracking-tight text-slate-100 mb-6 flex items-center gap-3">
            Упражнения:

          </h1>
          {hasexercises && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md-gap">
                {exerciseResults.map((item: any) => (
                  <Link
                    to = {`/exercise/${item.id}`}
                    key={item.id}
                    className="flex flex-col rounded-2xl bg-white shadow-md overflow-hidden items-center"
                  >
                    <img
                      src={`${constants.host}${item.avatar}`}
                      className="w-36 h-36 object-cover"
                    />

                    <div className="flex flex-col items-center text-center gap-y-4 px-4 py-2 text-slate-800">
                      <h1 className="font-bold text-sm sm:text-xl leading-7 tracking-tight">
                        {item.name}
                      </h1>
                    </div>
                  </Link>
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
