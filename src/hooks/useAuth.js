import { useSelector } from "react-redux"
import { selectCurrentToken } from "../features/auth/authSlice"
import { jwtDecode } from "jwt-decode"

const useAuth = () => {
    console.log('useAuth hook called on url change');
    const token = useSelector(selectCurrentToken)

    let isManager = false;
    let isAdmin = false;
    let status = "Employee"

    if (token) {
        const decoded = jwtDecode(token)
        const { username, roles } = decoded.userInfo
        console.log('token on url change from use auth:', token);
        console.log(`roles on url change from use auth`, roles)
        console.log(`decoded on url change from use auth`, decoded.userInfo)
        isManager = roles.includes("Manager")
        isAdmin = roles.includes("Admin")

        if (isManager) status = "Manager"
        if (isAdmin) status = "Admin"

        return {
            username,
            roles,
            status,
            isManager,
            isAdmin
        }
    }

    return {
        username: "",
        roles: [],
        isManager,
        isAdmin,
        status
    }
}

export default useAuth