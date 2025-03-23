import{ useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import axios from "axios";
import moment from "moment";

import accessKey from "~shared/scripts/accessKey.js";
import { getData, postData, putData } from "~shared/scripts/getData.js";

import DataTable from "~shared/ui/datatable";
import MySwal from "~shared/ui/sweetalert";

import "./index.scss";

import { Card, Button, Dropdown } from "react-bootstrap";

const TITLE = import.meta.env.VITE_TITLE;

function ManageClubs() {
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    const dataRef = useRef();

    const [optionList, setOptionList] = useState([
        { data: "창체", view: true },
        { data: "학술", view: true },
        { data: "공학", view: true },
        { data: "축제", view: true },
        { data: "체육", view: true },
        { data: "위원회", view: true },
        { data: "기타", view: true },
    ]);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const sessionID = await accessKey();
        const data = await getData("https://points.jshsus.kr/api/clubs/manage", { sessionID });

        dataRef.current = data;
        setupTable(data);
    }

    async function postClubs(clubId, value) {
        const sessionID = await accessKey();

        const res = postData(`https://points.jshsus.kr/api/clubs`, { clubId, ...value, sessionID });

        return res;
    }

    function setupTable(data) {
        if (!data) return;

        const dataList = data.map((x) => {
            const {
                id,
                name,
                leader,
                type,
                maxPeople,
                hasInterview,
                hasResume,
                applicantsCount,
                resumeLink,
                interviewInfo,
            } = x;

            return [
                id,
                name,
                leader ? `${leader.name} (${leader.stuid})` : "없음",
                leader ? leader.stuid : 0,
                type.type.replace(/(.*) 동아리/i, "$1"),
                type.id,
                maxPeople,
                applicantsCount > 0 ? `${applicantsCount / maxPeople} : 1 (${applicantsCount}명)` : "-",
                applicantsCount > 0 ? applicantsCount / maxPeople : 0,
                hasInterview ? (
                    <Button
                        className="rowButton"
                        variant="primary"
                        size="sm"
                        onClick={() => interviewHandler(x)}
                    >
                    면접 정보 </Button>
                ) : "없음",
                hasResume ? (
                    <Button
                        className="rowButton"
                        variant="primary"
                        size="sm"
                        onClick={() => resumeHandler(x)}
                    >
                    지원서 링크
                    </Button>
                ) : "없음",
                <Button
                    className="rowButton"
                    variant="primary"
                    size="sm"
                    onClick={() => removeHandler(x)}
                >
                    정보수정
                </Button>
            ];
        });

        setTableData(dataList);
        setColumns([
            { data: "ID" },
            { data: "동아리 이름" },
            { data: "동아리 짱" },
            { hidden: true },
            {
                className: "dt-content",
                data: (
                    <Dropdown onClick={optionHandler} autoClose="outside">
                        <Dropdown.Toggle variant="primary" id="dropdown-basic" size="sm">
                        동아리 종류
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                        {optionList.map((x, idx) => (
                            <Dropdown.Item
                                key={idx}
                                active={x.view == true}
                                onClick={(e) => optionSelect(e, idx, optionList)}
                            >
                            {x.data}
                            </Dropdown.Item>
                        ))}
                        </Dropdown.Menu>
                    </Dropdown>
                ),
                orderBase: 5,
            },
            { hidden: true },
            { data: "모집 인원" },
            { data: "경쟁률", orderBase: 8 },
            { hidden: true },
            { data: "면접", orderable: false },
            { data: "지원서", orderable: false },
            { data: "기타정보", orderable: false },
        ]);
    }

    function optionHandler(e) {
        e.stopPropagation();
    }

    function optionSelect(e, idx, list) {
        e = e || window.event;

        const arr = [...list];
        arr[idx].view = !arr[idx].view;

        const finalData = dataRef.current.filter((data) => {
            const { type } = data;

            return arr[type.id - 1].view;
        });

        setOptionList(arr);
        setupTable(finalData);
    }

    function removeHandler(club) {
        console.log(club);
        MySwal.fire({
            title: `${club.name} 정보 수정`,
            html: `
                    <input id="swal-club-name" class="swal2-input" placeholder="동아리 이름" value="${
                    club.name
                    }">
                    <input id="swal-max-people" type="number" class="swal2-input" placeholder="모집 인원" value="${
                    club.maxPeople
                    }">
                    <select id="swal-has-interview" class="swal2-input">
                        <option value="1" ${
                        club.hasInterview ? "selected" : ""
                        }>면접 있음</option>
                        <option value="0" ${
                        !club.hasInterview ? "selected" : ""
                        }>면접 없음</option>
                    </select>
                    <select id="swal-has-resume" class="swal2-input">
                        <option value="1" ${
                        club.hasResume ? "selected" : ""
                        }>지원서 있음</option>
                        <option value="0" ${
                        !club.hasResume ? "selected" : ""
                        }>지원서 없음</option>
                    </select>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "저장",
            cancelButtonText: "취소",
            preConfirm: () => {
                return {
                    name: document.getElementById("swal-club-name").value,
                    maxPeople: parseInt(
                        document.getElementById("swal-max-people").value,
                        10
                    ),
                    hasInterview:
                        document.getElementById("swal-has-interview").value === "1",
                    hasResume: document.getElementById("swal-has-resume").value === "1",
                };
            },
            }).then((result) => {
            if (result.isConfirmed) {
                postClubs(club.id, result.value)
                .then((response) => {
                    init();

                    MySwal.fire(
                        "수정 완료!",
                        "동아리 정보가 업데이트되었습니다.",
                        "success"
                    );
                })
                .catch((error) => {
                    console.error("오류", error);
                    if (error.response && error.response.status === 400) {
                        MySwal.fire("지원 불가", error.response.data.message, "error");
                    } else {
                        MySwal.fire(
                            "오류 발생",
                            "작업 중 문제가 발생했습니다. 관리자에게 문의하세요.",
                            "error"
                        );
                    }
                });
            }
        });
    }

    function resumeHandler(club) {
        MySwal.fire({
            title: `지원서 링크 수정`,
            html: <textarea id="swal-club-resumeLink" className="swal2-textarea" placeholder="지원서 링크" defaultValue={club.resumeLink}></textarea>,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "저장",
            cancelButtonText: "취소",
            preConfirm: () => {
                return {
                    ...club,
                    resumeLink: document.getElementById("swal-club-resumeLink").value,
                };
            },
            }).then((result) => {
            if (result.isConfirmed) {
                postClubs(club.id, result.value)
                .then((response) => {
                    init();

                    MySwal.fire(
                        "수정 완료!",
                        "동아리 정보가 업데이트되었습니다.",
                        "success"
                    );
                })
                .catch((error) => {
                    console.error("오류", error);
                    if (error.response && error.response.status === 400) {
                        MySwal.fire("지원 불가", error.response.data.message, "error");
                    } else {
                        MySwal.fire(
                            "오류 발생",
                            "작업 중 문제가 발생했습니다. 관리자에게 문의하세요.",
                            "error"
                        );
                    }
                });
            }
        });
    }

    function interviewHandler(club) {
        MySwal.fire({
            title: `면접 정보 수정`,
            html: <textarea id="swal-club-interviewInfo" className="swal2-textarea" placeholder="지원서 링크" defaultValue={club.interviewInfo}></textarea>,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "저장",
            cancelButtonText: "취소",
            preConfirm: () => {
                return {
                    ...club,
                    interviewInfo: document.getElementById("swal-club-interviewInfo").value,
                };
            },
            }).then((result) => {
            if (result.isConfirmed) {
                postClubs(club.id, result.value)
                .then((response) => {
                    init();

                    MySwal.fire(
                        "수정 완료!",
                        "동아리 정보가 업데이트되었습니다.",
                        "success"
                    );
                })
                .catch((error) => {
                    console.error("오류", error);
                    if (error.response && error.response.status === 400) {
                        MySwal.fire("지원 불가", error.response.data.message, "error");
                    } else {
                        MySwal.fire(
                            "오류 발생",
                            "작업 중 문제가 발생했습니다. 관리자에게 문의하세요.",
                            "error"
                        );
                    }
                });
            }
        });
    }

    return (
        <>
        <div id="apply">
            <Card>
                <Card.Header>
                    <Card.Title>동아리 신청하기</Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="tableWrap">
                    <Card.Text className="label">전체 동아리 목록</Card.Text>
                    <DataTable
                        className="applyTable"
                        columns={columns}
                        data={tableData}
                        order={[4, "asc"]}
                        options={{
                        language: {
                            search: "통합 검색: ",
                        },
                        }}
                    />
                    </div>
                </Card.Body>
            </Card>
        </div>
        </>
    );
}

export default ManageClubs;