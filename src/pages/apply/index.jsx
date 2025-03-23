import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import axios from "axios";
import moment from "moment";

import { getData, postData } from "~shared/scripts/getData.js";
import accessKey from "~shared/scripts/accessKey.js";

import DataTable from "~shared/ui/datatable";
import MySwal from "~shared/ui/sweetalert";

import "./index.scss";

import { Card, Button, Dropdown } from "react-bootstrap";

const TITLE = import.meta.env.VITE_TITLE;

function Apply() {
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
        const data = await getData("https://points.jshsus.kr/api/clubs", { sessionID });

        dataRef.current = data;
        setupTable(data);
    }

    async function postApply(isApplied, clubId) {
        const sessionID = await accessKey();

        try {
            let res = await postData(`https://points.jshsus.kr/api/clubs/${isApplied ? "deleteApply" : "apply"}`, { clubId, sessionID });

            return res;
        } catch ({ error, message }) {
            console.log(error, message);
        }
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
                isApplied,
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
                //maxPeople > 0 ? (applicantsCount > 0 ? `${(applicantsCount / maxPeople).toFixed(2)} : 1 (${applicantsCount}명)` : "-") : `${applicantsCount}명`,
                //maxPeople > 0 ? applicantsCount / maxPeople : 0,
                hasInterview ? 
                <Button
                    className="rowButton"
                    variant="primary"
                    size="sm"
                    onClick={() => showInterviewInfoHandler(interviewInfo)}
                >
                면접 정보
                </Button> : "X",
                hasResume ? <b>O</b> : "X",
                <Button disabled={type.id != 1}
                    className="rowButton"
                    variant="primary"
                    size="sm"
                    onClick={() => removeHandler(isApplied, id)}
                    style={{ backgroundColor: isApplied ? "red" : "blue" }}
                >
                    {isApplied ? "취소" : "신청"}
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
            //{ data: "경쟁률", orderBase: 8 },
            //{ hidden: true },
            { data: "면접", orderable: false },
            { data: "지원서", orderable: false },
            { data: "#", orderable: false },
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

    function showInterviewInfoHandler(interviewInfo) {
        MySwal.fire({
            title: "면접 정보",
            html: <p>{interviewInfo}</p>,
            icon: "info",
            confirmButtonText: "닫기",
        });
    }

    function removeHandler(isApplied, clubId) {
        MySwal.fire({
            title: (isApplied ? "취소" : "신청") + "하시겠습니까?",
            icon: "question",
            confirmButtonText: "예",
            showCancelButton: true,
            cancelButtonText: "아니오",
        }).then((result) => {
            if (result.isConfirmed) {
                postApply(isApplied, clubId)
                .then((response) => {
                    init();

                    const { result, club } = response;

                    if (result.affectedRows > 0) {
                        MySwal.fire(
                            "성공",
                            `동아리 ${isApplied ? "신청 취소" : "신청"}에 성공했습니다!`,
                            "success"
                        ).then(() => {
                            if (isApplied) return;

                            if (club.hasInterview || club.hasResume) MySwal.fire({
                                title: "추가 안내",
                                icon: "info",
                                html: (
                                    <>
                                        {club.hasResume ? <p>{club.name}의 입동 지원서입니다!: <a target="_blank" href={club.resumeLink}>링크</a></p> : null}
                                        {club.hasInterview ? <p>면접 안내: {club.interviewInfo}</p> : ""}
                                        <b style={{fontSize: ".8rem"}}>"동아리 신청" {">"} "내 신청 내역" 에서 다시 확인할 수 있습니다!</b>
                                    </>
                                )
                            });
                        });
                    } else {
                        MySwal.fire(
                            "실패",
                            "자원이 정상적으로 처리되지 않았습니다. 다시 시도해 주세요.",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    console.error("오류", error);
                    if (error.response && error.response.status === 400) {
                        MySwal.fire("지원 불가", error.response.message, "error");
                    } else {
                        MySwal.fire(
                            "오류 발생",
                            "작업 중 문제가 발생했습니다. 다시 시도해 주세요.",
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

export default Apply;