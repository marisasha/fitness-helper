import { useUser } from "../components/profile";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function StarsLogs() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const rewardStatuses = useSelector((state: any) => state.rewardStatuses);

  const getRewardStatuses = async () => {
    if (!user) return;
    const url = `${constants.host}/api/reward/statuses/${user.user_id}`;
    await components.constructorWebAction(dispatch, constants.rewardStatuses, url, "GET");
  };

  useEffect(() => {
    getRewardStatuses();
  }, [user]);

  const userRewards = rewardStatuses?.data?.user_rewards || [];
  const allRewards = rewardStatuses?.data?.all_rewards || [];

  return (
    <bases.Base>
      <div className="flex flex-col items-center mt-20 px-4 text-slate-100 w-full">

        {/* Награды пользователя */}
        {userRewards.length > 0 ? (
          <div className="w-full max-w-5xl mb-12">
            <h2 className="text-xl font-semibold">Ваши награды</h2>
            <div className="flex flex-col gap-4 md:flex-row">
              {userRewards.map((ur: any) => (
                <div
                  key={ur.id}
                  className="flex flex-col  items-center p-4 rounded-xl  transition-all"
                >
                  <img
                    src={`${constants.host}${ur.avatar}`}
                    alt={ur.exercise_name}
                    className="w-62 h-62 md:w-96 md:h-96 mb-2 rounded-lg"
                  />
                  <span className="text-slate-100 font-semibold text-sm text-center">
                    {ur.exercise_name} {ur.required_result} кг
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 mb-12">
            <p className="text-lg">У вас пока нет наград 😔</p>
            <p className="text-sm mt-1">Продолжайте тренироваться — звёзды не за горами!</p>
          </div>
        )}

        {/* Все остальные награды */}
        {allRewards.length > 0 && (
          <div className="w-full max-w-5xl">
            <h2 className="text-xl font-semibold ml-10">Доступные награды</h2>
            <div className="flex flex-col md:flex-row items-center p-4 rounded-xl  transition-all">
              {allRewards.map((ar: any) => (
                <div
                  key={ar.id}
                  className="flex flex-col items-center p-4 rounded-xl  transition-all"
                >
                  <img
                    src={`${constants.host}/media/exercise_reward_avatar/unknown_reward.png`}
                    alt={ar.exercise_name}
                    className="w-62 h-62 md:w-96 md:h-96 mb-2 rounded-lg"
                  />
                  <span className="text-slate-100 font-semibold text-sm text-center">
                    {ar.exercise_name} {ar.required_result} кг
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </bases.Base>
  );
}
