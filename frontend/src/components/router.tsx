// external
import { BrowserRouter, Routes, Route } from "react-router-dom";

// base

import Register from "../pages/Register";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Profile from "../pages/Profile"
import ChangeProfile from "../pages/ChangeProfile"
import CreateWorkout from "../pages/CreateWorkout"
import Workouts from "../pages/Workouts"
import Workout from "../pages/Workout"
import ComplatedWorkouts from "../pages/CompletedWorkouts"
import WorkoutStatistics from "../pages/WorkoutStatistics"
import WorkoutsStatistics from "../pages/WorkoutsStatistics"
import MainPage from "../pages/MainPage"
import Friends from "../pages/Friends"
import FriendProfile from "../pages/FriendProfile"
import FriendWorkoutsStatistics from "../pages/FriendWorkoutsStatistics"
import ExerciseStatistics from "../pages/ExerciseStatistics"
import ExercisesInstruction from "../pages/ExercisesInstruction"
import ExerciseInstruction from "../pages/ExerciseInstruction"
import StarsLogs from "../pages/StarsLogs"
import UserRewardStatuses from "../pages/UserRewardStatuses"




export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* base */}
        <Route path={"register/"} element={<Register />}></Route>
        <Route path={"/"} element={<Login />}></Route>
        <Route path={"logout/"} element={<Logout />}></Route>

        <Route path={"home/"} element={<MainPage />} />

        <Route path={"friends/"} element={<Friends />} />
        <Route path={"friend/friend-profile/:friendId"} element={<FriendProfile />} />
        <Route path={"friend/workouts-statistics/:friendId/"} element={<FriendWorkoutsStatistics />} />

        <Route path={"workouts/"} element={<Workouts/>}></Route>
        <Route path={"workouts/create-workout/"} element={<CreateWorkout/>}></Route>
        <Route path={"workouts/training/:workoutId/user/:userId/"} element={<Workout />} />
        <Route path={"workouts/completed-workouts/:userId/"} element={<ComplatedWorkouts/>}></Route>
        <Route path={"workouts/workout-statistics/:workoutId/"} element={<WorkoutStatistics />} />
        <Route path={"workouts-statistics/"} element={<WorkoutsStatistics />} />
        <Route path={"workouts-statistics/exercise/:exerciseName/"} element={<ExerciseStatistics />} />

        <Route path={"exercises/"} element={<ExercisesInstruction/>} />
        <Route path={"exercise/:exerciseId/"} element={<ExerciseInstruction/>} />


        <Route path={"profile/"} element={<Profile />} />
        <Route path={"profile/change-profile/"} element={<ChangeProfile />} />
        <Route path={"profile/stars-logs/"} element={<StarsLogs/>} />
        <Route path={"profile/statuses/"} element={<UserRewardStatuses/>} />
        {/* safe redirect */}
      </Routes>
    </BrowserRouter>
  );
}