import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials } from "../../features/auth/authSlice"


const baseQuery = fetchBaseQuery({
    baseUrl: "https://technotes-api.onrender.com",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token

        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }

        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions) // result from initial/first req

    if (result?.error?.status === 403) { // Access Token Expired 403
        console.log(`Sending Refresh Token`)

        // Send Refresh Token to Get New Access Token
        const RefreshResult = await baseQuery(`/auth/refresh`, api, extraOptions)

        if (RefreshResult?.data) {
            // store the new Access Token
            api.dispatch(setCredentials({ ...RefreshResult?.data }))

            // Retry with New Access Token
            result = await baseQuery(args, api, extraOptions)
        } else {
            if (RefreshResult?.error?.status === 403) { // Refresh Token Expired 403
                RefreshResult.error.data.message = "Your Login has Expired."
            }

            return RefreshResult // returns the error
        }
    }

    return result // Result after retrying the original baseQuery
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Notes", "Users"],
    endpoints: builder => ({})
})