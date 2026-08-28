import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  login: false,
  user: {},
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.login = action.payload.login;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.login = false;
      state.user = {};
    },
  },
});

export const { setCredentials, logout } = userSlice.actions;
export default userSlice.reducer;
