import React from "react";
import { Outlet } from "react-router-dom";

const SharedLayout = () => {
  console.log("hi");
  return (
    <>
      {/* <Header/> */}
      <main>
        <Outlet />
      </main>

      {/* <Footer /> */}
    </>
  );
};
export default SharedLayout;
