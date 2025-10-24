import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import * as constants from "../components/constants";
import * as utils from "../components/utils";

export default function Page() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch({ type: constants.userLogin.reset });
        dispatch({ type: constants.userRegister.reset });
        dispatch({ type: constants.userProfile.reset });

        utils.LocalStorage.remove("userLogin.data.access");
        utils.LocalStorage.remove("userLogin.data.refresh");
        utils.LocalStorage.remove("user_id");

        navigate("/");
    }, []);

    return <div></div>;
    }