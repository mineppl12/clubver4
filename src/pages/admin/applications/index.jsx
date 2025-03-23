import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";

import accessKey from "~shared/scripts/accessKey.js";
import { getData, postData, putData } from "~shared/scripts/getData.js";

import DataTable from "~shared/ui/datatable";
import MySwal from "~shared/ui/sweetalert";

import "./index.scss";

import { Card, Button, Dropdown } from "react-bootstrap";

const TITLE = import.meta.env.VITE_TITLE;

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
    const sessionID = await accessKey();
    const data = await getData(
      "https://points.jshsus.kr/api/clubs/admin/applications",
      { sessionID }
    );

    dataRef.current = data;
    setupTable(data);
  }

  function setupTable(data) {
    if (!data) return;

    const dataList = data.map((x) => {
      const { id, user, club, createdAt, isApproved, type } = x;

      return [
        id,
        club.name,
        type.type.replace(/(.*) 동아리/i, "$1"),
        type.id,
        `${user.name} (${user.stuid})`,
        user.stuid,
        moment(createdAt).format("YYYY-MM-DD HH:mm:ss"),
        isApproved ? "O" : "X",
      ];
    });

    setTableData(dataList);
    setColumns([
      { data: "ID" },
      { data: "동아리 이름" },
      {
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
        orderBase: 3,
      },
      { hidden: true },
      { data: "지원자", orderBase: 5 },
      { hidden: true },
      { data: "지원 날짜" },
      { data: "합격 여부" },
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

  const exportExcel = () => {
    const data = tableData.map((x) => {
      return {
        ID: x[0],
        "동아리 이름": x[1],
        "동아리 종류": x[2],
        이름: x[4].split(" ")[0],
        학번: x[5],
        "지원 날짜": x[6],
        "합격 여부": x[7],
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(
      wb,
      `동아리 신청내역 ${moment().format("YYYY-MM-DD HH-mm-ss")}.xlsx`
    );
  };

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
                  button: [
                    <Button
                      className="tableButton"
                      onClick={exportExcel}
                      variant="success"
                    >
                      Excel
                    </Button>,
                  ],
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
