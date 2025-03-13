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

function AdminClubs() {
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
    const data = await getData("https://points.jshsus.kr/api/clubs");

    dataRef.current = data;
    setupTable(data);
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
      } = x;

      return [
        id,
        name,
        leader ? `${leader.name} (${leader.stuid})` : "없음",
        leader ? leader.stuid : 0,
        type.type.replace(/(.*) 동아리/i, "$1"),
        type.id,
        maxPeople,
        applicantsCount > 0 ? `${applicantsCount / maxPeople} : 1` : "-",
        hasInterview ? "O" : "X",
        hasResume ? "O" : "X",
        1,

        <>
          <Button
            className="rowButton"
            variant="primary"
            size="sm"
            onClick={() => removeHandler(id)}
          >
            정보수정
          </Button>
        </>,
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
      { data: "경쟁률", orderBase: 9 },
      { data: "면접 여부", orderable: false },
      { data: "지원서 여부", orderable: false },
      { hidden: true },

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

      return arr[type - 1].view;
    });

    setOptionList(arr);
    setupTable(finalData);
  }

  function removeHandler() {
    MySwal.fire({
      title: "정보수정구현요망",
      icon: "question",
      confirmButtonText: "확인",
      showCancelButton: true,
      cancelButtonText: "취소",
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

export default AdminClubs;
