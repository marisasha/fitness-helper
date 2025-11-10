import { useUser } from "../components/profile";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";
import { useParams } from "react-router-dom";

export default function Page() {
  const user: any = useUser();
  const { exerciseId } = useParams();
  const dispatch = useDispatch();
  const exercise = useSelector((state: any) => state.exercisesInstruction);


  const getExercise = async () => {
    if (!user) return;
    const url = `${constants.host}/api/exercise/instruction/${exerciseId}`;
    try {
      await components.constructorWebAction(
        dispatch,
        constants.exercisesInstruction,
        url,
        "GET"
      );
    } catch (err) {
      console.error("Ошибка при загрузке упражнения:", err);
    } 
  };

  useEffect(() => {
    getExercise();
  }, [user, exerciseId]);

  if (exercise.load) {
    return (
      <bases.Base>
        <div className="w-full flex justify-center items-center h-96">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </bases.Base>
    );
  }

  return (
    <bases.Base>
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col gap-12 text-slate-800">
        {/* Заголовок */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold text-center text-slate-100">
            {exercise.data?.name ?? ""}
          </h1>
        </div>

        {/* Контент */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Изображение */}
          <div className="flex-shrink-0">
            <img
              src={`${constants.host}${exercise.data?.avatar ?? ""}`}
              alt={exercise.data?.name ?? "Exercise"}
              className="w-full max-w-md h-auto rounded-3xl shadow-xl object-cover"
            />
          </div>

          {/* Детали упражнения */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-3xl font-semibold text-cyan-600 mb-2">
                Описание
              </h2>
              <p className="text-lg text-slate-700">
                {exercise.data?.description ?? ""}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-3xl font-semibold text-cyan-600 mb-2">
                Техника выполнения
              </h2>
              <p className="text-lg text-slate-700">
                {exercise.data?.exercise_technique ?? ""}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-3xl font-semibold text-cyan-600 mb-2">
                Рекомендации для начинающих
              </h2>
              <p className="text-lg text-slate-700">
                <span className="font-semibold">Мужчинам:</span>{" "}
                {exercise.data?.recommendations_for_men ?? "-"}
              </p>
              <p className="text-lg text-slate-700 mt-2">
                <span className="font-semibold">Женщинам:</span>{" "}
                {exercise.data?.recommendations_for_women ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </bases.Base>
  );
}
