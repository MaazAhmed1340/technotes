import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const usersAdapter = createEntityAdapter({})

const initialState = usersAdapter.getInitialState()

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: () => ({
                url : "/users",
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError;
                },
            }),
            transformResponse: responseData => {
                const loadedUsers = responseData.map((user) => {
                    user.id = user._id;
                    return user
                })
                return usersAdapter.setAll(initialState, loadedUsers)
            },
            providesTags: (result, error, args) => {
                if (result?.ids) {
                    return [
                        { type: "Users", id: "LIST" },
                        ...result.ids.map(id => ({ type: "Users", id }))
                    ]
                } else {
                    return [{ type: "Users", id: "LIST" },]
                }
            }
        }),
        addNewUser: builder.mutation({
            query: (initialUserData) => ({
                url: "/users",
                method: "POST",
                body: {
                    ...initialUserData
                }
            }),
            invalidatesTags: [
                {
                    type: "Users", id: "LIST"
                }
            ]
        }),
        updateUser: builder.mutation({
            query: (initialUserData) => ({
                url: "/users",
                method: "PATCH",
                body: {
                    ...initialUserData
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Users", id: arg.id }
            ]
        }),
        deleteUser: builder.mutation({
            query: ({ id }) => ({
                url: "/users",
                method: "DELETE",
                body: { id }
            }),
            invalidatesTags: (error, result, arg) => [
                { type: "Users", id: arg.id }
            ]
        })
    })
})

export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

const selectUsersData = createSelector(
    selectUsersResult, userResult => userResult.data
)

export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)

export const {
    useGetUsersQuery,
    useAddNewUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation
} = usersApiSlice