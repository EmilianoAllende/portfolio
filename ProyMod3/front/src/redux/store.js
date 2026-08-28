import { configureStore } from "@reduxjs/toolkit";
import { usersApi } from "../redux/features/users/usersApi";
import usersReducer from "../redux/features/users/usersSlice";
import { appointmentsApi } from "../redux/features/appointments/appointmentsApi";

const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [appointmentsApi.reducerPath]: appointmentsApi.reducer,
    usersSlice: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApi.middleware,
      appointmentsApi.middleware
    ),
});

export default store;
