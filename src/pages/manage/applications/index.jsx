import { useLocation, useNavigate } from "react-router-dom";
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

function ManageApplications() {
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    const dataRef = useRef();
    const viewDataRef = useRef();

    const [optionList, setOptionList] = useState([]);

    useEffect(() => {
        init();
    }, []);

    async function init(){
        try{
            const sessionID = await accessKey();
            const data = await getData("https://points.jshsus.kr/api/clubs/applications", {sessionID});
            const myClubs = await getData("https://points.jshsus.kr/api/clubs/manage", {sessionID});
    
            setOptionList(myClubs.map((x, idx) => {
                return {
                    data: x.name,
                    view: true,
                    clubId: x.id
                };
            }));
            dataRef.current = data;
            viewDataRef.current = data;
            setupTable(data);
        }
        catch(err){
            setupTable([]);
        }
    }

    async function postApplication(applyId, newStatus){
        const sessionID = await accessKey();

        const res = postData(`https://points.jshsus.kr/api/clubs/applications`, {isApproved: newStatus, sessionID, applyId});

        return res;
    }

    function setupTable(data) {
        if (!data) return;

        const dataList = data.map((x) => {
            const { id, user, club, createdAt, isApproved } = x;

            return [
                id,
                club.name,
                `${user.name} (${user.stuid})`,
                user.stuid,
                moment(createdAt).format("YYYY-MM-DD HH:mm:ss"),
                isApproved ? "O" : "X",
                <>
                <Button
                    className="rowButton"
                    variant="primary"
                    size="sm"
                    onClick={() => removeHandler(id, isApproved)}
                    style={{ backgroundColor: isApproved ? "red" : "blue" }}
                >
                    {isApproved ? "취소" : "합격"}
                </Button>
                </>,
            ];
        });

        setTableData(dataList);
        setColumns([
            { data: "ID" },
            { data: (
                <Dropdown onClick={optionHandler} autoClose="outside">
                    <Dropdown.Toggle variant="primary" id="dropdown-basic" size="sm">
                    동아리 이름
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
                ), },
            { data: "지원자", orderBase: 3 },
            { hidden: true },
            { data: "지원 날짜" },
            { data: "합격 여부" },
            { data: "#", orderable: false },
        ]);
    }

    useEffect(() => {
        setupTable(viewDataRef.current);
    }, [optionList]);

    function optionHandler(e) {
        e.stopPropagation();
    }

    function optionSelect(e, idx, list) {
        e = e || window.event;

        const arr = [...list];
        arr[idx].view = !arr[idx].view;

        const viewList = list.map((x, indx) => x.view ? x.clubId : null);

        const finalData = dataRef.current.filter((data) => {
            const { clubId } = data;

            return viewList.includes(clubId);
        });

        viewDataRef.current = finalData;
        setOptionList(arr);
        setupTable(finalData);
    }

    function removeHandler(applyId, isApproved) {
        const newStatus = isApproved ? 0 : 1;
        const actionText = isApproved ? "합격 취소" : "합격 처리";

        MySwal.fire({
            title: `${actionText} 하시겠습니까?`,
            text: `이 지원자를 ${actionText}합니다.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: actionText,
            cancelButtonText: "취소",
            }).then((result) => {
            if (result.isConfirmed) {
                postApplication(applyId, newStatus)
                .then((result) => {
                    init();
                    MySwal.fire({
                        icon: "success",
                        title: `${actionText} 완료!`,
                        text: `지원자가 ${actionText}되었습니다.`,
                        }).then(() => {
                        // 새로고침 (F5와 같은 효과)
                        // window.location.reload();
                    });
                })
                .catch((error) => {
                    console.log(error);
                    MySwal.fire({
                        icon: "error",
                        title: "오류 발생",
                        text: "상태 변경 중 오류가 발생했습니다.",
                    });
                });
            }
        });
    }

    return (
        <>
        <div id="apply">
            <Card>
            <Card.Header>
                <Card.Title>내 동아리 신청 내역</Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="tableWrap">
                <Card.Text className="label">내 동아리 신청 내역</Card.Text>
                <DataTable
                    className="applyTable"
                    columns={columns}
                    data={tableData}
                    order={[0, "desc"]}
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

export default ManageApplications;
