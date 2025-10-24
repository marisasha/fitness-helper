import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as bases from "../components/bases";
import * as utils from "../components/utils";
import * as constants from "../components/constants";
import * as components from "../components/components";
import * as loaders from "../components/loaders";
import { Link } from "react-router-dom";

export default function Page() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userLogin = useSelector((state: any) => state.userLogin);
    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    function sendForm(event: any) {
        event.preventDefault();

        if (form.password !== "" && !userLogin.load) {
        components.constructorWebAction(
            dispatch,
            constants.userLogin,
            `${constants.host}/api/token/`,
            "POST",
            {},
            { username: form.username, password: form.password },
            10000,
            true,
            true
        );
        } else {
        window.alert("Заполните пароль!");
        }
    }

    useEffect(() => {
        if (userLogin && userLogin.data) {
        utils.LocalStorage.set("userLogin.data.access", userLogin.data.access);
        utils.LocalStorage.set("userLogin.data.refresh", userLogin.data.refresh);
        setTimeout(() => {
            navigate("/home");
        }, 2000);
        }
    }, [userLogin]);


    return (
            <div className="sm:mx-auto sm:w-full sm:max-w-xl mt-28 flex flex-col items-center justify-center">
            
                <div className="flex items-end text-l font-semibold leading-6 text-cyan-600 hover:text-gray-600 justify-center">
                    <span className="text-5xl">Fitnes</span>
                    <span className="text-slate-100">helper</span>
                </div>

                <h2 className="mt-10  text-3xl font-bold leading-9 tracking-tight text-slate-100">Войдите в свой аккаунт</h2>
                    
                    <form className={"mt-8 w-9/12 max-w-4xlm "} onSubmit={sendForm}>
                        <InputField label="Логин" value={form.username} onChange={(e:any) => setForm({ ...form, username: e.target.value })} placeholder="ivan" type="text" />
                        <InputField label="Пароль" value={form.password} onChange={(e:any) => setForm({ ...form, password: e.target.value })} placeholder="password" type="password" />

                        <article>
                            <loaders.Loader1 isView={userLogin.load} />
                            {userLogin.error && (
                            <div className="alert alert-danger" role="alert">
                                {userLogin.error}
                            </div>
                            )}
                            {userLogin.fail && (
                            <div className="alert alert-danger" role="alert">
                                {userLogin.fail}
                            </div>
                            )}
                            {userLogin.data && (
                            <div className="w-full h-12 bg-green-500 text-slate-100  text-bold text-m rounded mt-3 flex items-center justify-center font-semibold" role="alert">
                                Вы успешно вошли в аккаунт!
                            </div>
                            )}
                        </article>

                        <div className="mt-10">
                            <button type="submit" className="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-slate-100 hover:text-cyan-600 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ">Войти</button>
                            <span className="block text-m font-semibold leading-6 text-slate-100 mt-3 text-center" > У вас еще нет аккаунта ?<Link to = {"/register"} className="text-cyan-600 hover:text-gray-600"> Зарегистрируйтесь !</Link></span>
                        </div>
                    </form>
                </div>
    );
    }


function InputField({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white mt-2">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        required
        className="mt-2 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm"
      />
    </div>
  );
}