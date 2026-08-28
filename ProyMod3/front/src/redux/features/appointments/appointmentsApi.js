import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const appointmentsApi = createApi({
  reducerPath: "appointmentsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/appointments/" }),
  endpoints: (builder) => ({
    cancelAppointment: builder.mutation({
      query: (appId) => ({
        url: `cancel/${appId}`,
        method: "PUT",
      }),
    }),

    scheduleAppointment: builder.mutation({
      query: (newAppointmentData) => ({
        url: "schedule",
        method: "POST",
        body: newAppointmentData
      }),
    }),

  }),
});


export const { useCancelAppointmentMutation, useScheduleAppointmentMutation } = appointmentsApi;
