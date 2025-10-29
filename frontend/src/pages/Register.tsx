import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as utils from "../components/utils";
import * as constants from "../components/constants";
import * as components from "../components/components";
import * as loaders from "../components/loaders";
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRegister = useSelector((state: any) => state.userRegister);

  const [form, setForm] = useState({
    username: "",
    surname: "",
    name: "",
    birthDate: null as string | null, // заменили old на birthDate
    weight: null as number | null,
    height: null as number | null,
    password: "",
    password2: "",
    avatar: null as File | null,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const checkUsernameAvailability = async (username: string) => {
    if (username.length === 0) {
      setUsernameAvailable(null);
      setUsernameError(null);
      return;
    }

    try {
      const response = await axios.get(`${constants.host}/api/check/user/${username}`);
      if (response.data.exists) {
        setUsernameAvailable(false);
        setUsernameError("Пользователь с таким никнеймом уже существует");
      } else {
        setUsernameAvailable(true);
        setUsernameError(null);
      }
    } catch (error) {
      setUsernameAvailable(false);
      setUsernameError("Ошибка при проверке никнейма пользователя");
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value; // <- берём значение из input
    setForm({ ...form, username });
    checkUsernameAvailability(username);
};


  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  function sendForm(event: React.FormEvent) {
    event.preventDefault();

    if (form.password !== form.password2) {
      window.alert("Пароли не совпадают!");
      return;
    }

    if (!userRegister.load) {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("password", form.password);
      formData.append("password2", form.password2);
      formData.append("surname", form.surname);
      formData.append("name", form.name);
      if (form.birthDate) formData.append("birth_date", form.birthDate); // старое поле old
      if (form.weight !== null) formData.append("weight", String(form.weight));
      if (form.height !== null) formData.append("height", String(form.height));
      if (form.avatar) formData.append("avatar", form.avatar);

      components.constructorWebAction(
        dispatch,
        constants.userRegister,
        `${constants.host}/api/register`,
        "POST",
        {},
        formData,
        10000,
        true,
        true
      );
    }
  }

  useEffect(() => {
    if (userRegister && userRegister.data) {
      utils.LocalStorage.set("username", form.username);
      setTimeout(() => {
        navigate("/");
        dispatch({ type: constants.userRegister.reset });
      }, 2000);
    }
  }, [userRegister]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-end justify-center text-l font-semibold leading-6 text-cyan-600 hover:text-gray-600">
        <span className="text-5xl">Fitness</span>
        <span className="text-white">helper</span>
      </div>
      <h2 className="mt-4 text-2xl sm:text-3xl font-semibold text-white text-center">
        Введите данные для регистрации
      </h2>

      <form
        onSubmit={sendForm}
        className="mt-8 w-11/12 max-w-4xl rounded-2xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Левая колонка */}
        <div className="space-y-5">
          {/* Аватар */}
          <div className="flex flex-col items-center">
            <label className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-dashed border-gray-600 cursor-pointer hover:border-cyan-500 transition-colors duration-300">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  className="w-full h-full object-cover"
                  alt="Avatar Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <span className="text-sm mt-1 text-center">
                    Загрузить аватарку
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleAvatarChange}
              />
            </label>
            {avatarPreview && (
              <p className="mt-2 text-gray-300 text-sm truncate w-32 text-center">
                Файл выбран
              </p>
            )}
          </div>

          <InputField
            label="Логин"
            value={form.username}
            onChange={(val: string) => {
              setForm({ ...form, username: val });
              checkUsernameAvailability(val);
            }}
            placeholder="Ivan"
          />
          {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}

          <InputField
            label="Пароль"
            value={form.password}
            onChange={(val: string) => setForm({ ...form, password: val })}
            placeholder="password"
            type="password"
          />
          <InputField
            label="Подтвердите пароль"
            value={form.password2}
            onChange={(val: string) => setForm({ ...form, password2: val })}
            placeholder="password"
            type="password"
          />
        </div>

        {/* Правая колонка */}
        <div className="space-y-5">
          <InputField
            label="Имя"
            value={form.name}
            onChange={(val: string) => setForm({ ...form, name: val })}
            placeholder="Иван"
          />
          <InputField
            label="Фамилия"
            value={form.surname}
            onChange={(val: string) => setForm({ ...form, surname: val })}
            placeholder="Иванов"
          />

          <DateInput
            label="Дата рождения"
            value={form.birthDate}
            onChange={(val) => setForm({ ...form, birthDate: val })}
            placeholder="1990-09-09"
          />

          <NumericInput
            label="Вес (кг)"
            value={form.weight}
            onChange={(val) => setForm({ ...form, weight: val })}
            placeholder="80"
          />
          <NumericInput
            label="Рост (см)"
            value={form.height}
            onChange={(val) => setForm({ ...form, height: val })}
            placeholder="180"
          />
        </div>

        {/* Статусы */}
        <div className="md:col-span-2 mt-4">
          <loaders.Loader1 isView={userRegister.load} />
          {userRegister.error && <Alert type="error" message={userRegister.error} />}
          {userRegister.fail && <Alert type="error" message={userRegister.fail} />}
          {userRegister.data && <Alert type="success" message="Вы успешно зарегистрировались!" />}
        </div>

        {/* Кнопка */}
        <div className="md:col-span-2 flex justify-center">
          {usernameAvailable ? (
            <button
              type="submit"
              className="flex w-1/2 justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-slate-100 hover:text-cyan-600 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 "
            >
              Зарегистрироваться
            </button>
          ) : (
            <div
              className="flex w-1/2 justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-slate-100 hover:text-cyan-600 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 "
            >
              Зарегистрироваться
            </div>
          )}
        </div>
      </form>
    </div>
  );
}


function InputField({ label, value, onChange, placeholder, type = "text" }: any) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (label === "Логин") {
      // Разрешаем только латиницу, цифры и подчёркивание
      if (!/[a-zA-Z0-9_]/.test(e.key) &&
          !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    } else if (label === "Имя" || label === "Фамилия") {
      // Запрещаем цифры
      if (/[0-9]/.test(e.key) &&
          !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (label === "Логин") {
      val = val.replace(/[^a-zA-Z0-9_]/g, "");
    } else if (label === "Имя" || label === "Фамилия") {
      val = val.replace(/[0-9]/g, "");
    }

    onChange(val);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-white mt-2">{label}</label>
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type={type}
        required
        className="mt-2 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm"
      />
    </div>
  );
}


function NumericInput({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
}: {
  label: string;
  value: number | null;
  placeholder: string;
  onChange: (val: number | null) => void;
  min?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white mt-2">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        className="no-spinner mt-2 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm"
        placeholder={placeholder}
        value={value === null ? "" : value}
        onChange={(e) => {
          const val = e.target.value === "" ? null : Math.max(min, +e.target.value);
          onChange(val);
        }}
        onKeyDown={(e) => {
          if (
            !/[0-9]/.test(e.key) &&
            !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
          ) {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}
function DateInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | null; // формат YYYY-MM-DD
  placeholder?: string;
  onChange: (val: string | null) => void;
}) {
  const today = new Date();

  const minAllowedDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const maxAllowedDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());

  // Преобразуем value в Date для DatePicker
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );

  const handleChange = (date: Date | null) => {
    setSelectedDate(date);
    onChange(date ? date.toISOString().split("T")[0] : null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-white mt-2">{label}</label>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        placeholderText={placeholder}
        className="mt-2 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm"
        minDate={minAllowedDate}
        maxDate={maxAllowedDate}
        dateFormat="yyyy-MM-dd"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        wrapperClassName="w-full"
      />
    </div>
  );
}

function Alert({ type, message }: { type: "error" | "success"; message: string }) {
  const base = "w-full p-3 rounded-md text-center font-semibold";
  const color = type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white";
  return <div className={`${base} ${color}`}>{message}</div>;
}
