import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as constants from "../components/constants";
import * as components from "../components/components";
import * as bases from "../components/bases";
import { useUser } from "../components/profile";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ChangeProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user: any = useUser();
  const profile = useSelector((state: any) => state.userProfile);

  const [form, setForm] = useState<any>({
    username: "",
    surname: "",
    name: "",
    birth_date: null, // строка YYYY-MM-DD
    weight: null,
    height: null,
    password: "",
    avatar: null,
    delete_avatar: false,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(true);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const checkUsernameAvailability = async (username: string) => {
    if (!username) {
      setUsernameAvailable(null);
      setUsernameError(null);
      return;
    }
    try {
      const response = await axios.get(`${constants.host}/api/check/user/${username}`);
      if (response.data.exists && profile.data.username !== username) {
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

  const getProfile = async () => {
    if (!user?.user_id) return;
    try {
      await components.constructorWebAction(
        dispatch,
        constants.userProfile,
        `${constants.host}/api/profile/${user.user_id}/1`,
        "GET"
      );
    } catch (err) {
      console.error("Ошибка при загрузке профиля:", err);
    }
  };

  useEffect(() => {
    if (user?.user_id) getProfile();
  }, [user]);

  useEffect(() => {
    if (profile?.data) {
      setForm({
        username: profile.data.username ?? "",
        surname: profile.data.surname ?? "",
        name: profile.data.name ?? "",
        birth_date: profile.data.birth_date ?? null,
        weight: profile.data.weight ?? null,
        height: profile.data.height ?? null,
        password: "",
        avatar: null,
        delete_avatar: false,
      });
      setAvatarPreview(profile.data.avatar_url ? `${constants.host}/${profile.data.avatar_url}` : null);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, avatar: file, delete_avatar: false });
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const sendForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.user_id) return;

    const formData = new FormData();
    formData.append("username", form.username ?? "");
    formData.append("password", form.password ?? "");
    formData.append("surname", form.surname ?? "");
    formData.append("name", form.name ?? "");
    if (form.birth_date) formData.append("birth_date", form.birth_date);
    if (form.weight !== null) formData.append("weight", String(form.weight));
    if (form.height !== null) formData.append("height", String(form.height));
    if (form.avatar) formData.append("avatar", form.avatar);
    if (form.delete_avatar) formData.append("delete_avatar", "true");

    await components.constructorWebAction(
      dispatch,
      constants.userUpdate,
      `${constants.host}/api/change/profile/${user.user_id}`,
      "POST",
      {},
      formData
    );

    alert("Профиль успешно изменен!");
    navigate("/profile");
  };

  if (!profile?.data) return <p className="text-center text-white mt-10">Загрузка профиля...</p>;

  const data = profile.data;

  return (
    <bases.Base>
      <form onSubmit={sendForm} className="min-h-screen flex flex-col items-center py-10 px-4 m-auto w-full">
        <h2 className="text-3xl font-semibold text-white mb-8 mt-10">Редактирование профиля</h2>

        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Аватар */}
          <div className="flex justify-center items-center gap-x-3">
            <label className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-dashed border-gray-600 cursor-pointer hover:border-cyan-500 transition-colors duration-300">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  className="w-full h-full object-cover"
                  alt="Avatar Preview"
                />
              ) : (
                <img
                  src={avatarPreview ?? (data.avatar ? `${constants.host}/${data.avatar}` : "")}
                  className="w-full h-full object-cover"
                  alt="Avatar Preview"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleAvatarChange}
              />
            </label>

            <div className="mt-2 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview(`${constants.host}/media/profile_avatar/anonim.png`);
                  setForm({ ...form, avatar: null, delete_avatar: true });
                }}
                className="text-red-500 hover:text-slate-100 text-lg mt-1 underline"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          {/* Поля профиля */}
          <ProfileField
            label="Логин"
            span={form.username}
            type="text"
            onChange={(val) => {
              setForm({ ...form, username: val });
              checkUsernameAvailability(val);
            }}
          />
          {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}

          <ProfileField
            label="Имя"
            span={form.name}
            type="text"
            onChange={(val) => setForm({ ...form, name: val })}
          />
          <ProfileField
            label="Фамилия"
            span={form.surname}
            type="text"
            onChange={(val) => setForm({ ...form, surname: val })}
          />
          <ProfileDateField
            label="Дата рождения"
            span={form.birth_date}
            onChange={(val) => setForm({ ...form, birth_date: val })}
          />
          <ProfileField
            label="Вес (кг)"
            span={form.weight?.toString() ?? ""}
            type="number"
            onChange={(val) => setForm({ ...form, weight: val ? Number(val) : null })}
          />
          <ProfileField
            label="Рост (см)"
            span={form.height?.toString() ?? ""}
            type="number"
            onChange={(val) => setForm({ ...form, height: val ? Number(val) : null })}
          />

          {usernameAvailable ? (
            <button
              type="submit"
              className="flex w-3/4 m-auto justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-slate-100 hover:text-cyan-600 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Сохранить изменения
            </button>
          ) : (
            <div className="flex w-3/4 m-auto justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-slate-100 hover:text-cyan-600 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Сохранить изменения
            </div>
          )}
        </div>
      </form>
    </bases.Base>
  );
}

/* ======= ProfileField ======= */
function ProfileField({
  label,
  span,
  onChange,
  type = "text",
}: {
  label: string;
  span: string;
  onChange?: (val: string) => void;
  type?: "text" | "number";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(span ?? "");

  useEffect(() => setValue(span ?? ""), [span]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (type === "number") val = val.replace(/\D/g, "");
    if (type === "text") val = val.replace(/\d/g, "");
    setValue(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="flex justify-between">
      <div className="flex flex-col flex-1">
        <span className="text-sm text-gray-400">{label}</span>
        {!isEditing ? (
          <span className="mt-1 text-white">{value || "-"}</span>
        ) : (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            className="mt-1 rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 sm:text-sm"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsEditing(!isEditing)}
        className="ml-3 text-cyan-600 hover:text-white text-lg text-center mt-1"
      >
        {!isEditing ? <i className="fa-solid fa-pen-to-square"></i> : <i className="fa-solid fa-xmark"></i>}
      </button>
    </div>
  );
}

/* ======= ProfileDateField ======= */
function ProfileDateField({
  label,
  span,
  onChange,
}: {
  label: string;
  span: string | null; // YYYY-MM-DD
  onChange?: (val: string | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const parseDate = (d: string | null) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const [value, setValue] = useState<Date | null>(parseDate(span));

  const today = new Date();
  const minAllowedDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const maxAllowedDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());

  useEffect(() => setValue(parseDate(span)), [span]);

  const handleChange = (date: Date | null) => {
    setValue(date);
    if (onChange) onChange(date ? date.toISOString().split("T")[0] : null);
  };

  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-col flex-1">
        <span className="text-sm text-gray-400">{label}</span>
        {!isEditing ? (
          <span className="mt-1 text-white">{value ? value.toISOString().split("T")[0] : "-"}</span>
        ) : (
          <DatePicker
            selected={value}
            onChange={handleChange}
            minDate={minAllowedDate}
            maxDate={maxAllowedDate}
            dateFormat="yyyy-MM-dd"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 sm:text-sm"
            wrapperClassName="w-full"
            placeholderText="Выберите дату"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsEditing(!isEditing)}
        className="ml-3 text-cyan-600 hover:text-white text-lg mt-1"
      >
        {!isEditing ? <i className="fa-solid fa-pen-to-square"></i> : <i className="fa-solid fa-xmark"></i>}
      </button>
    </div>
  );
}
