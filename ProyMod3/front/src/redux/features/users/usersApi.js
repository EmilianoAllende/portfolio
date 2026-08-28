import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/users/" }),
  endpoints: (builder) => ({
    getUserById: builder.query({
      query: (id) => `${id}`,
    }),
    loginUser: builder.mutation({
      query: (userData) => ({
        url: "login",
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

export const { useGetUserByIdQuery, useLoginUserMutation } = usersApi;
