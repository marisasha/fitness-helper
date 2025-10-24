import { configureStore } from "@reduxjs/toolkit";
import * as components from "./components";
import * as constants from "./constants";
export const store = configureStore({
  reducer: {
    // @ts-ignore
    users: components.constructorReducer(constants.users),
    // @ts-ignore
    userRegister: components.constructorReducer(constants.userRegister),
    // @ts-ignore
    userLogin: components.constructorReducer(constants.userLogin),
    // @ts-ignore
    userUpdate: components.constructorReducer(constants.userUpdate),
    // @ts-ignore
    userProfile: components.constructorReducer(constants.userProfile),
    // @ts-ignore
    workoutList: components.constructorReducer(constants.workoutList),
    // @ts-ignore
    workoutPlan: components.constructorReducer(constants.workoutPlan),
    // @ts-ignore
    workoutFinish: components.constructorReducer(constants.workoutFinish),
    // @ts-ignore
    workoutId: components.constructorReducer(constants.workoutId),
    // @ts-ignore
    workoutStatistics: components.constructorReducer(constants.workoutStatistics),
    // @ts-ignore
    workoutsStatistics: components.constructorReducer(constants.workoutsStatistics),
    // @ts-ignore
    userExercises: components.constructorReducer(constants.userExercises),
    // @ts-ignore
    workoutFinishList: components.constructorReducer(constants.workoutFinishList),
    // @ts-ignore
    workoutPurpose: components.constructorReducer(constants.workoutPurpose),
    // @ts-ignore
    userName: components.constructorReducer(constants.userName),
    // @ts-ignore
    workoutListRecommended: components.constructorReducer(constants.workoutListRecommended),
    // @ts-ignore
    workoutRepeatId: components.constructorReducer(constants.workoutRepeatId),
    // @ts-ignore
    userFriends: components.constructorReducer(constants.userFriends),
    // @ts-ignore
    usersProfile: components.constructorReducer(constants.usersProfile),
    // @ts-ignore
    userRequestsToFriends: components.constructorReducer(constants.userRequestsToFriends),
    // @ts-ignore
    addFriend: components.constructorReducer(constants.addFriend),
    // @ts-ignore
    deleteFriend: components.constructorReducer(constants.deleteFriend),
    // @ts-ignore
    friendProfile: components.constructorReducer(constants.friendProfile),
    // @ts-ignore
    FriendWorkoutsStatistics: components.constructorReducer(constants.FriendWorkoutsStatistics),
    // @ts-ignore
    exerciseStatistics: components.constructorReducer(constants.exerciseStatistics),

    
  },
});
export default store;