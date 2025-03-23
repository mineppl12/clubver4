import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { getData, postData } from "~shared/scripts/getData.js";
import { setCookie, getCookie, removeCookie } from "~shared/scripts/cookies";

library.add(fas);

// ### Import pages ###
import Home from "~pages/home";
import About from "~pages/about";

import MyApply from "~pages/apply/myapply";
import Apply from "~pages/apply";

import ManageApplications from "~pages/manage/applications";
import ManageClubs from "~pages/manage/clubs";

import AdminClubs from "~pages/admin/clubs";
import AdminApplications from "~pages/admin/applications";

import Page404 from "~pages/404";
import Users from "~pages/users";

// ### Import shared components ###
import Navbar from "~shared/ui/navbar";
import Sidebar from "~shared/ui/sidebar";
import { pathKeys } from "~shared/lib/react-router/pathKey.js";

// === Layout Component ===
function Layout({ userPermissions, sessionID }) {
    const location = useLocation();
    const isFullScreen = location.pathname === pathKeys.about.root();

    return (
        <>
            <Sidebar userPermissions={userPermissions} />
            <Navbar sessionID={sessionID} />
            <div className={isFullScreen ? "fullScreen" : "panel"}>
                <div className="panel_wrap">
                    <Outlet />
                </div>
            </div>
        </>
    );
}

// === Initialize Router Function ===
async function init() {
    const userType = {
        applicant: new Set(["applicant"]),
        admin: new Set(["applicant", "manager", "admin"]),
        guest: new Set([]),
    };

    let userPermissions = userType["guest"];
    const sessionID = getCookie("jshsusIAM2");

    let data = await getData("https://iam.jshsus.kr/iam2", { sessionID });
    if (typeof data === "string") data = JSON.parse(data);

    if (data.isLogined) {
        userPermissions = await getData("https://points.jshsus.kr/api/clubs/permissions", { sessionID });
        userPermissions = new Set(userPermissions.permissions);
    }

    const routesWithPermissions = [
        { pathKey: pathKeys.home.root(), element: <Home /> },
        { pathKey: pathKeys.about.root(), element: <About /> },
        { pathKey: pathKeys.apply.root(), element: <Apply /> },
        { pathKey: pathKeys.myApply.root(), element: <MyApply /> },
        { pathKey: pathKeys.manage.applications(), element: <ManageApplications /> },
        { pathKey: pathKeys.manage.clubs(), element: <ManageClubs /> },
        { pathKey: pathKeys.admin.clubs(), element: <AdminClubs /> },
        { pathKey: pathKeys.admin.applications(), element: <AdminApplications /> },
        { pathKey: pathKeys.users.root(), element: <Users /> },
    ];

    const filteredRoutes = routesWithPermissions
        .filter(route => !route.pathKey.permission || userPermissions.has(route.pathKey.permission))
        .map(({ pathKey, element }) => ({ path: pathKey.link, element }));

    return createBrowserRouter([
        {
            element: <Layout userPermissions={userPermissions} sessionID={sessionID} />,
            children: [...filteredRoutes, { path: "*", element: <Page404 /> }],
        },
    ]);
}

// === AppRouter Component ===
export default function AppRouter() {
    const [ browserRouter, setBrowserRouter ] = useState(null);

    useEffect(() => {
        async function loadRouter() {
            const router = await init();
            setBrowserRouter(router);
        }
        loadRouter();
    }, []);

    if (!browserRouter) {
        return <div>Loading...</div>;
    }

    return <RouterProvider router={browserRouter} />;
}