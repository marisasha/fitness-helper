import { useUser } from "../components/profile";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as bases from "../components/bases";
import * as components from "../components/components";
import * as constants from "../components/constants";

export default function StarsLogs() {
  const user: any = useUser();
  const dispatch = useDispatch();
  const starsLogs = useSelector((state: any) => state.userStarsLogs);

  const getPurpose = async () => {
    if (!user) return;
    const url = `${constants.host}/api/user/reward/logs/${user.user_id}`;
    await components.constructorWebAction(dispatch, constants.userStarsLogs, url, "GET");
  };

  useEffect(() => {
    getPurpose();
  }, [user]);

  const hasStarsLogs =
    starsLogs?.data && Array.isArray(starsLogs.data) && starsLogs.data.length > 0;

  return (
    <bases.Base>
      <div className="flex flex-col items-center mt-16 px-4 text-slate-100 w-full">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center">
          История моих наград 
        </h1>
        <p className="text-slate-400 text-center mb-10 text-sm sm:text-base">
          Здесь отображаются все звёзды, которые вы заработали за достижения и тренировки.
        </p>

        {hasStarsLogs ? (
          <div className="w-full max-w-5xl">
            <div className="hidden sm:grid grid-cols-12 py-3 px-4 border-b border-slate-700 text-slate-400 text-sm font-semibold">
              <div className="col-span-1 text-left">#</div>
              <div className="col-span-6 sm:col-span-7 text-left">Достижение</div>
              <div className="col-span-2 text-center">Звёзды</div>
            </div>


            <div className="divide-y divide-slate-700">
              {starsLogs.data.map((log: any, index: number) => (
                <div
                  key={log.id}
                  className="grid sm:grid-cols-12 gap-y-1 items-center py-4 px-4 hover:bg-slate-800/40 transition-all rounded-xl sm:rounded-none"
                >

                  <div className="flex sm:hidden flex-col gap-1">
                    <div className="text-slate-400 text-xs">#{index + 1}</div>
                    <div className="text-slate-100 font-semibold text-base">
                      {log.achievement}
                    </div>
                    <div className="flex justify-between text-sm text-slate-400 mt-1">
                      <span className="text-cyan-400 font-semibold">
                        +{log.count_of_added_stars} ⭐
                      </span>
                      <span>
                        {new Date(log.date_reward).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:block col-span-1 text-slate-400 text-sm">
                    {index + 1}
                  </div>

                  <div className="hidden sm:block col-span-6 sm:col-span-7 text-slate-100 text-sm sm:text-base break-words">
                    {log.achievement}
                  </div>

                  <div className="hidden sm:block col-span-2 text-center text-cyan-400 font-semibold">
                    +{log.count_of_added_stars} ⭐
                  </div>

                  <div className="hidden sm:block col-span-3 text-right text-slate-400 text-xs sm:text-sm">
                    {new Date(log.date_reward).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-10">
            <p className="text-lg">У вас пока нет наград 😔</p>
            <p className="text-sm mt-1">
              Продолжайте тренироваться — звёзды не за горами!
            </p>
          </div>
        )}
      </div>
    </bases.Base>
  );
}
