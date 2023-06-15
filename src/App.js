import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import SharedLayout from "./components/SharedLayout";
import Home from "./components/Home";
import Log from "./components/Log";
import Inscription from "./components/Inscription";
import Admin from "./components/Admin";
import Pageadmin from "./components/Pageadmin";
import Reset from "./components/Reset";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<SharedLayout />}>
        <Route index element={<Home />} />
        <Route path="log" element={<Log />} />
        <Route path="admin" element={<Admin />} />
        <Route path="pageadmin" element={<Pageadmin />} />
        <Route path="inscription" element={<Inscription />} />
        <Route path="reset" element={<Reset />} />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
export default App;
