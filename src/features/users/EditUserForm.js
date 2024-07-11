import { useEffect, useState } from "react";
import { useUpdateUserMutation, useDeleteUserMutation } from "./usersApiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../../config/roles";

const USER_REGEX = /^[A-z]{3,20}$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

const EditUserForm = ({ user }) => {
    const [updateUser, { isLoading, isSuccess, isError, error }] =
        useUpdateUserMutation();

    const [
        deleteUser,
        { isSuccess: isDelSuccess, error: delerror },
    ] = useDeleteUserMutation();

    const navigate = useNavigate();

    const [username, setUsername] = useState(user.username);
    const [validUsername, setValidUsername] = useState(false);
    const [password, setPassword] = useState("");
    const [validPassword, setValidPassword] = useState(false);

    const [roles, setRoles] = useState(user.roles);
    const [active, setActive] = useState(user.active);

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username));
    }, [username]);

    useEffect(() => {
        setValidPassword(PWD_REGEX.test(password));
    }, [password]);

    useEffect(() => {
        if (isSuccess || isDelSuccess) {
            setUsername("");
            setPassword("");
            setRoles([]);
            navigate("/dash/users");
        }
    }, [isSuccess, isDelSuccess, navigate]);

    const onUserNameChange = (e) => setUsername(e.target.value);
    const onPasswordChange = (e) => setPassword(e.target.value);
    const onActiveChange = () => setActive((prev) => !prev);

    const onRolesChange = (e) => {
        const values = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );
        setRoles(values);
    };

    const onSaveClicked = async (e) => {
        if (password) {
            await updateUser({ id: user.id, username, password, roles, active });
        } else {
            await updateUser({ id: user.id, username, roles, active });
        }
    };

    const onDelClicked = async () => {
        await deleteUser({ id: user.id });
    };

    const options = Object.values(ROLES).map((role) => {
        return (
            <option key={role} value={role}>
                {role}
            </option>
        );
    });

    let canSave;
    if (password) {
        canSave =
            [roles?.length, validUsername, validPassword].every(Boolean) &&
            !isLoading;
    } else {
        canSave = [roles?.length, validUsername].every(Boolean) && !isLoading;
    }

    const errClass = isError ? "errMsg" : "offscreen";
    const validUserClass = !validUsername ? "form__input--incomplete" : "";
    const validPasswordClass =
        password && !validPassword ? "form__input--incomplete" : "";
    const validRolesClass = !Boolean(roles?.length)
        ? "form__input--incomplete"
        : "";

    const errContent = (error?.data?.message || delerror?.data?.message) ?? "";

    let content = (
        <>
            <p className={errClass}>{errContent}</p>

            <form className="form" onSubmit={e => e.preventDefault()}>
                <div className="form__title-row">
                    <h2>Edit User</h2>
                    <div className="form__action-buttons">
                        <button
                            className="icon-button"
                            title="Save"
                            disabled={!canSave}
                            onClick={onSaveClicked}
                        >
                            <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button
                            className="icon-button"
                            title="Delete"
                            disabled={!canSave}
                            onClick={onDelClicked}
                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </div>
                </div>
                <label className="form__label" htmlFor="username">
                    Username : <span className="nowrap">[3-20 letters]</span>
                </label>
                <input
                    className={`form__input ${validUserClass}`}
                    type="text"
                    id="username"
                    name="username"
                    autoComplete="off"
                    value={username}
                    onChange={onUserNameChange}
                />

                <label className="form__label" htmlFor="password">
                    Password :{" "}
                    <span className="nowrap">[4-12 characters including !@#$%]</span>
                </label>

                <input
                    className={`form__input ${validPasswordClass}`}
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="off"
                    value={password}
                    onChange={onPasswordChange}
                />

                <label className="form__label" htmlFor="user-active">
                    ACTIVE :{" "}
                    <input type="checkbox" checked={active} onChange={onActiveChange} id="user-active" name="user-active" className="form__label" />
                </label>

                <label className="form__label" htmlFor="roles">
                    Assigned Roles :
                </label>
                <select
                    name="roles"
                    id="roles"
                    className={`form__input ${validRolesClass}`}
                    multiple={true}
                    size="3"
                    value={roles}
                    onChange={onRolesChange}
                >
                    {options}
                </select>
            </form>
        </>
    );

    return content;
};

export default EditUserForm;
