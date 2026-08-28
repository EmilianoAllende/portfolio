import Navbar from "./components/Navbar/Navbar";
import HomeView from "./views/HomeView";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import { Routes, Route, Navigate } from "react-router-dom";
import { SLASH, MYAPPPOINTMENTS, REGISTER } from "./utils/routes";
import { useSelector } from "react-redux";
import FormNewAppointment from "./components/FormNewAppointment/FormNewAppointment";
import AboutUs from "./components/AboutUs/AboutUs"; 

const ProtectedRoute = ({ children }) => {
  const isLogged = useSelector((state) => state.usersSlice.login);

  if (!isLogged) {
    return <Navigate to={SLASH} replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path={SLASH} element={<Login />} />
        <Route
          path={MYAPPPOINTMENTS}
          element={
            <ProtectedRoute>
              <HomeView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nuevo-turno"
          element={
            <ProtectedRoute>
              <FormNewAppointment />
            </ProtectedRoute>
          }
        />
        <Route path={REGISTER} element={<Register />} />
        <Route path="/sobre-nosotros" element={<AboutUs />} />
      </Routes>
    </>
  );
}

export default App;
