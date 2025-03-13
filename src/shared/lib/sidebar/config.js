import { pathKeys } from "~shared/lib/react-router/pathKey.js";

export const config = [
  {
    wraps: [
      {
        links: [
          {
            pathKey: pathKeys.about.root(),
            icon: "shapes",
            name: "서비스 소개",
          },
        ],
      },
    ],
  },
  {
    legend: "지원자",
    wraps: [
      {
        header: {
          icon: "file",
          name: "동아리 신청",
        },
        links: [
          {
            pathKey: pathKeys.apply.root(),
            icon: "folder-open",
            name: "동아리 신청하기",
          },
          {
            pathKey: pathKeys.myApply.root(),
            icon: "file-pen",
            name: "내 신청내역",
          },
        ],
      },
    ],
  },
  {
    legend: "동아리 짱",
    wraps: [
      {
        header: {
          icon: "users",
          name: "내 동아리 관리",
        },
        links: [
          {
            pathKey: pathKeys.manage.applications(),
            icon: "user-plus",
            name: "지원자 조회",
          },
        ],
      },
    ],
  },
  {
    legend: "관리자",
    wraps: [
      {
        header: {
          icon: "lock",
          name: "통합 관리",
        },
        links: [
          {
            pathKey: pathKeys.admin.clubs(),
            icon: "users-gear",
            name: "전체 동아리 관리",
          },
          {
            pathKey: pathKeys.admin.applications(),
            icon: "file-lines",
            name: "전체 신청 내역",
          },
        ],
      },
    ],
  },
];
