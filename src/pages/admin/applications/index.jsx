import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import axios from "axios";
import moment from "moment";

import DataTable from "~shared/ui/datatable";
import MySwal from "~shared/ui/sweetalert";

import "./index.scss";

import { Card, Button, Dropdown } from "react-bootstrap";

const TITLE = import.meta.env.VITE_TITLE;

async function getData(url, params = {}) {
    const response = await axios.get(`${url}`, {
        params: params,
    });

    return response.data;
}

function AdminApplications() {
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
        const data = await getData(
        "https://points.jshsus.kr/api/clubs/admin/applications"
        );

        dataRef.current = data;
        setupTable(data);
    }

    function setupTable(data) {
        if (!data) return;

        const dataList = data.map((x) => {
        const { id, user, club, leader, type } = x;

        return [
            id,
            `${user.name} (${user.stuid})`,
            user.stuid,
            club.name,
            leader ? leader.name : "없음",
            type,
            type,
            moment(createdAt).format("YYYY-MM-DD HH:MM:SS"),
            "O",
        ];
        });

        setTableData(dataList);
        setColumns([
        { data: "ID" },
        { data: "지원자" },
        { hidden: true },
        { data: "동아리 이름" },
        { data: "동아리 짱" },
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
            orderBase: 6,
        },
        { hidden: true },
        { data: "신청 날짜" },
        { data: "통과 여부", orderable: false },
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

        return arr[type - 1].view;
        });

        setOptionList(arr);
        setupTable(finalData);
    }

    return (
        <>
        <div id="apply">
            <Card>
            <Card.Header>
                <Card.Title>내 신청내역</Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="tableWrap">
                <Card.Text className="label">내 신청내역 조회</Card.Text>
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

export default AdminApplications;