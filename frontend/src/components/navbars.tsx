import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useUser } from "../components/profile";


export function Navbar() {
  const user : any = useUser()
  if (!user) {
      return (
        <h1></h1>
      );
    }
  return (
    <nav className="m-0 flex flex-col justify-between w-full fixed top-0 left-0 bg-slate-100 border rounded-b-3xl" aria-label="Global">
      
      <div className="flex items-end ml-5 gap-x-5 mt-2 mb-3 justify-center ">
        
        {/* <div className="flex items-end text-l font-semibold leading-6 text-cyan-600 hover:text-gray-600">
          <span className="text-5xl">Fitnes</span>
          <span className="">helper</span>
        </div> */}

        <div className={"flex gap-x-5 items-center "}>
          <div className="flex gap-x-12 items-center">
            <Link to="/home" className="text-l font-semibold leading-6 text-cyan-600 hover:text-gray-600 flex gap-x-2 items-center">
              <i className="fa-solid fa-house"></i>
              <span>Главная</span>
            </Link>
          </div>
          <div className="flex gap-x-12 items-center">
            <Link to="/workouts" className="text-l font-semibold leading-6 text-cyan-600 hover:text-gray-600 flex gap-x-2 items-center ">
              <i className="fa-solid fa-dumbbell"></i>
              <span>Тренировки</span>
            </Link>
          </div>
          
          <div className="flex gap-x-12 items-center">
            <Link to={`/workouts-statistics`} className="text-l font-semibold leading-6 text-cyan-600 hover:text-gray-600 flex gap-x-2 items-center ">
              <i className="fa-solid fa-square-poll-vertical"></i>
              <span>Статистика</span>
            </Link>
          </div>
        <div className="flex gap-x-12 items-center">
            <Link to="/profile" className="text-l font-semibold leading-6 text-cyan-600 hover:text-gray-600 flex gap-x-2 items-center ">
              <i className="fa-solid fa-user"></i>
              <span>Профиль</span>
            </Link>
          </div>
        </div>

      </div>

    </nav>
  );
}