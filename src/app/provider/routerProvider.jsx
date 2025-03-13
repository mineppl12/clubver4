import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    useLocation,
} from "react-router-dom";
  
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { getData, postData } from "~shared/scripts/getData.js";

import { setCookie, getCookie } from '~shared/scripts/cookies';

library.add(fas);

// ###

import Home from "~pages/home";

import MyApply from "~pages/myapply";
import Apply from "~pages/apply";

import ManageApplications from "~pages/manage/applications";

import AdminClubs from "~pages/admin/clubs";
import AdminApplications from "~pages/admin/applications";

import Page404 from "~pages/404";

import Users from "~pages/users";

// ###

import Navbar from "~shared/ui/navbar";
import Sidebar from "~shared/ui/sidebar";
import { pathKeys } from "~shared/lib/react-router/pathKey.js";
import { useEffect } from "react";
  
const userType = {
    applicant: new Set(["applicant"]),
    admin: new Set(["applicant", "manager", "admin"]),
};
  
const userPermissions = userType["admin"];
  
function Layout() {
    const location = useLocation();
    const isFullScreen = location.pathname === pathKeys.about.root();

    useEffect(() => {
        init();
    }, []);

    async function init(){
        const myCookie = getCookie("jshsusIAM2");
        const data = await getData("https://iam.jshsus.kr/iam2", {}, true);
        console.log(myCookie);
    }

    return (
    <>
        <Sidebar userPermissions={userPermissions} />
        <Navbar />
        <div className={isFullScreen ? "fullScreen" : "panel"}>
            <div className="panel_wrap">
                <Outlet />
            </div>
        </div>
    </>
    );
}
  
const routesWithPermissions = [
    { pathKey: pathKeys.home.root(), element: <Home /> },
    { pathKey: pathKeys.apply.root(), element: <Apply /> },
    { pathKey: pathKeys.myApply.root(), element: <MyApply /> },
  
    { pathKey: pathKeys.manage.applications(), element: <ManageApplications /> },
  
    { pathKey: pathKeys.admin.clubs(), element: <AdminClubs /> },
    { pathKey: pathKeys.admin.applications(), element: <AdminApplications /> },

    { pathKey: pathKeys.users.root(), element: <Users /> },
];
  
const filteredRoutes = routesWithPermissions
    .filter(
      (route) =>
        !route.pathKey.permission || userPermissions.has(route.pathKey.permission)
    )
    .map(({ pathKey, element }) => ({ path: pathKey.link, element }));
  
const browserRouter = createBrowserRouter([
    {
      element: <Layout />,
      children: [...filteredRoutes, { path: "*", element: <Page404 /> }],
    },
]);
  
export default function AppRouter() {
    return <RouterProvider router={browserRouter} />;
}  