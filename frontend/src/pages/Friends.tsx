// Updated FriendsPage with h1 and Autocomplete in one line full width
import { useUser } from "../components/profile";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as bases from "../components/bases";
import { Autocomplete, TextField } from "@mui/material";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function FriendsPage() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const friends = useSelector((state: any) => state.userFriends || {});
  const profiles = useSelector((state: any) => state.usersProfile || {});
  const requests = useSelector((state: any) => state.userRequestsToFriends || {});

  const getFriends = async () => {
    if (!user) return;
    const url = `${constants.host}/api/user/friends/${user.user_id}`;
    await components.constructorWebAction(dispatch, constants.userFriends, url, "GET");
  };

  const getUsersProfile = async () => {
    if (!user) return;
    const url = `${constants.host}/api/profiles/all`;
    await components.constructorWebAction(dispatch, constants.usersProfile, url, "GET");
  };
  
  const getRequestsToFriends = async () => {
    if (!user) return;
    const url = `${constants.host}/api/user/requests/${user.user_id}`;
    await components.constructorWebAction(dispatch, constants.userRequestsToFriends, url, "GET");
  };

  const createRequestFriend = async (from_user: number, to_user: number) => {
    if (!from_user || !to_user) return;
    const body = { from_user, to_user };
    const url = `${constants.host}/api/send/request/to/friends`;

    try {
      await components.constructorWebAction(dispatch, constants.workoutPurpose, url, "POST", {}, body);
      alert("Запрос оправлен!");
    } catch (err) {
      console.error("Ошибка отправки запроса", err);
    }
  };
  
  const addFriend = async (from_user: number, to_user: number) => {
    if (!from_user || !to_user) return;
    const body = { from_user, to_user };
    const url = `${constants.host}/api/add/friend`;

    try {
      await components.constructorWebAction(dispatch, constants.addFriend, url, "POST", {}, body);
      alert("Запрос принят!");
      getRequestsToFriends();
      getFriends();
    } catch (err) {
      console.error("Ошибка отправки запроса", err);
    }
  };
  
  const deleteFriend = async (from_user: number, to_user: number) => {
    if (!from_user || !to_user) return;
    const body = { from_user, to_user };
    const url = `${constants.host}/api/delete/friend`;

    try {
      await components.constructorWebAction(dispatch, constants.deleteFriend, url, "DELETE", {}, body);
      alert("Друг удален");
      getRequestsToFriends();
      getFriends();
    } catch (err) {
      console.error("Ошибка отправки запроса", err);
    }
  };

  useEffect(() => {
    getFriends();
    getUsersProfile();
    getRequestsToFriends();
  }, [user]);

  const hasFriends = friends?.data && friends.data.length > 0;
  const hasRequests = requests?.data && requests.data.length > 0;
  const hasProfiles = profiles?.data && profiles.data.length > 0;
  const uniqueProfiles = hasProfiles
    ? Array.from(new Map(profiles.data.map((p: any) => [p.user_id, p])).values())
    : [];

  return (
    <bases.Base>
      <div className="flex justify-center mt-20 ml-5 w-full mr-5">
        <div className="flex flex-col gap-6 w-full max-w-screen-xl">

          <div className="flex gap-x-4 items-center m-auto">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-100 whitespace-nowrap text-center">Друзья</h1>
            {(friends.load || requests.load || profiles.load) &&  (
                <div className="w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              )}
          </div>
          <div className="flex items-center w-full mt-5 ">
            {hasProfiles && !friends.load && (
              <Autocomplete
                freeSolo
                className="w-full"
                options={uniqueProfiles}
                getOptionLabel={(option: any) =>
                  typeof option === "string" ? option : `${option.name} ${option.surname}`
                }
                filterOptions={(options, { inputValue }) => {
                  const words = inputValue.toLowerCase().split(/\s+/).filter(Boolean);
                  if (words.length === 0) return [];

                  return options.filter((option: any) => {
                    const name = option.name.toLowerCase();
                    const surname = option.surname.toLowerCase();
                    return words.every(word => name.includes(word) || surname.includes(word));
                  });
                }}
                renderOption={(props, option: any) => {
                const isProfile = typeof option === "object" && option !== null && option.user_id;

                // Проверяем, есть ли пользователь уже в друзьях
                const isAlreadyFriend = friends?.data?.some(
                  (f: any) => f.friend_id === option.user_id
                );

                return (
                  <li
                    // @ts-ignore
                    key={isProfile ? option.user_id : option}
                    {...props}
                    className="flex items-center justify-between gap-4 p-2 text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      {isProfile && (
                        <img
                          src={constants.host + option.avatar}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <span className="text-slate-800">
                        {isProfile ? `${option.name} ${option.surname}` : option}
                      </span>
                    </div>

                    {isProfile && (
                      isAlreadyFriend ? (
                        <div className="bg-cyan-600 text-slate-100 hover:text-cyan-600 px-3 py-1 rounded hover:bg-slate-100">
                          <i className="fa-solid fa-check "></i>
                        </div>
                      ) : (
                        <button
                          className="bg-cyan-600 text-slate-100 hover:text-cyan-600 px-3 py-1 rounded hover:bg-slate-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            createRequestFriend(option.user_id, user.user_id);
                          }}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      )
                    )}
                  </li>
                );
              }}

                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Найти пользователя"
                    variant="outlined"
                    className="w-full"
                    sx={{
                      '& .MuiInputLabel-root': { color: 'white' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'white' },
                        '&:hover fieldset': { borderColor: 'white' },
                        '&.Mui-focused fieldset': { borderColor: 'white' },
                      },
                    }}
                  />
                )}
              />
            )}
          </div>
        
        {hasRequests && hasProfiles? (
          <div className="w-full flex flex-col gap-y-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 mb-4">
              Запросы в друзья
            </h1>

            {requests.data.map((friend: any) => (
              <div
                key={friend.friend_id}
                className="flex items-center border-2 border-slate-100 p-4 rounded-2xl shadow gap-4 w-full max-w-md  justify-start"
              >
                <img
                  src={constants.host + friend.friend_avatar}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover "
                />
                <div className="flex justify-between w-full">
                  <p className="text-lg font-semibold text-slate-100">
                    {friend.friend_name || "Без имени"} {friend.friend_surname || ""}
                  </p>
                  <div className="flex gap-x-2">
                    <button
                    className="bg-cyan-600 text-slate-100 hover:text-cyan-600 px-3 py-1 rounded hover:bg-slate-100"
                    onClick={(e) => {
                      addFriend(friend.friend_id, user.user_id);
                    }}
                  >
                    <i className="fa-solid fa-check "></i>
                  </button>
                  <button
                    className="bg-cyan-600 text-slate-100 hover:text-cyan-600 px-3 py-1 rounded hover:bg-slate-100"
                    onClick={(e) => {
                      deleteFriend(friend.friend_id, user.user_id);
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ''}
           {hasFriends && hasProfiles && !requests.load? (
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 mb-4">
            Мои друзья
          </h1>
          ):(
            !friends.load && !profiles.load && !requests.load ? 
            <h1 className="text-sm text-slate-100 mb-4">У вас пока нет друзей</h1>
            :""
          )}
          
          <div className="w-full flex flex-col gap-y-4">
            {hasFriends && hasProfiles && !requests.load ? (
              friends.data.map((friend: any) => (
                <div
                  key={friend.friend_id}
                  className="flex items-center border-2 border-slate-100 p-4 rounded-2xl shadow gap-4 w-full max-w-md  justify-start"
                >
                  <img
                    src={constants.host + friend.friend_avatar}
                    alt="avatar"
                    className="w-24 h-24 object-cover rounded-full"
                  />
                  <div className="flex flex-col gap-y-2 w-full">
                    <div className="flex w-full justify-between text-m ">
                      <p className="font-semibold text-slate-100">
                        {friend.friend_name || "Без имени"} {friend.friend_surname || ""}
                      </p>
                    </div>
                    <Link to={`/friend/friend-profile/${friend.friend_id}`}>
                      <div className="bg-cyan-600 text-slate-100 px-3 py-1 rounded hover:text-cyan-600 hover:bg-slate-100 w-28 flex justify-center font-semibold">
                        Профиль
                      </div>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              ""
            )}
          </div>


        </div>
      </div>
    </bases.Base>
  );
}
