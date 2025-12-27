import { Outlet } from "react-router-dom";

const WithoutNavbar = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export default WithoutNavbar;
