import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ToastContainer } from "react-toastify";
import AuthInit from "./components/AuthInit";
function App() {
  return (
    <>
    <AuthInit>
       <RouterProvider router={router} />
    </AuthInit>
      <ToastContainer />
    </>
  );
}

export default App;
