export const pathKeys = {
    root: "/",
    home: {
        root() {
            return {
                link: pathKeys.root,
                permission: null,
            };
        },
    },
    about: {
        root() {
            return {
                link: pathKeys.root.concat("about/"),
                permission: null,
            };
        },
    },
    apply: {
        root() {
            return {
                link: pathKeys.root.concat("apply/"),
                permission: "applicant",
            };
        },
    },
    myApply: {
        root() {
            return {
                link: pathKeys.root.concat("myapply/"),
                permission: "applicant",
            };
        },
    },
    manage: {
        root() {
            return pathKeys.root.concat("manage/");
        },
        applications() {
            return {
                link: pathKeys.manage.root().concat("applications/"),
                permission: "manager",
            };
        },
    },
    admin: {
        root() {
            return pathKeys.root.concat("admin/");
        },
        clubs() {
            return {
                link: pathKeys.admin.root().concat("clubs/"),
                permission: "admin",
            };
        },
        applications() {
            return {
                link: pathKeys.admin.root().concat("applications/"),
                permission: "admin",
            };
        },
    },
    users: {
        root(){
            return {
                link: pathKeys.root.concat("users/"),
                permission: null
            }
        }
    },
    page404() {
        return pathKeys.root.concat("404/");
    },
};
