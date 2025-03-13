import { useState, useEffect, useRef } from 'react';
import Pagination from 'react-bootstrap/Pagination';

import './index.scss';

const maxViewPage = 5;

const DataTable = ({ columns, data, order, className, options }) => {
    const [ sortMethod, setSortMethod ] = useState({});
    const [ rowPerPage, setRowPerPage ] = useState(10);
    const [ page, setPage ] = useState(1);
    const [ maxPage, setMaxPage ] = useState(1);

    const [ filteredData, setFilteredData ] = useState(data);
    const [ viewData, setViewData ] = useState(data);

    const thRef = useRef([]);
    const thRefWidths = useRef([]);

    function pagination(sortedData, rowCount, pageTo){
        const slicedData = sortedData.slice((pageTo - 1) * rowCount, pageTo * rowCount);

        setPage(pageTo);

        return slicedData;
    }

    function sort(wholeData, wholeColumns, sortMethodTo){
        let { column, asc } = sortMethodTo;
        column = wholeColumns[column] ? (wholeColumns[column].orderBase ? wholeColumns[column].orderBase : column) : column;

        function compare(a, b){
            if (typeof a === 'number' && typeof b === 'number') return a - b;

            const strA = String(a);
            const strB = String(b);
            
            return strA.localeCompare(strB, undefined, { numeric: true });
        }

        wholeData.sort((x, y) => {
            const result = compare(x[column], y[column]);
            
            return asc ? result : -result;
        });

        setSortMethod(sortMethodTo);

        return wholeData;
    }

    function fixWidth(refs){
        const el = refs.current;
        const widths = [];

        el.map((x, idx) => {
            const w = x.offsetWidth;
            widths.push(w);
            x.style.width = `${w}px`;
        });

        thRefWidths.current = widths;

        return widths;
    }

    function draw(wholeData, wholeColumns, sortMethodTo, pageTo){
        const sortedData = sort(wholeData, wholeColumns, sortMethodTo);
        const slicedData = options && options.pagination == false ? sortedData : pagination(sortedData, rowPerPage, pageTo);

        if (thRefWidths.current.length == 0) thRefWidths.current = fixWidth(thRef);

        setMaxPage(options && options.pagination == false ? 1 : Math.ceil(sortedData.length / rowPerPage));
        setFilteredData(wholeData);
        setViewData(slicedData);
    }

    function filter(e, wholeData, columns, sortMethod, page){
        e = e || window.event;

        const keyword = String(e.target.value);

        if (keyword == ""){
            draw(wholeData, columns, sortMethod, page);
            return;
        }

        const finalData = wholeData.filter((col) => {
            const isValid = col.map((td, _) => {
                if (!(typeof td == "string" || typeof td == "number")) return false;
                td = String(td);
                if (td.search(keyword) >= 0) return true;
                else false;
            }).reduce((x, y) => x || y);

            return isValid;
        });

        draw(finalData, columns, sortMethod, page);
    }

    useEffect(() => {
        draw(data, columns, {column: order ? order[0] : 0, asc: order ? order[1] === 'asc' : true}, 1);

        function resize(){
            thRefWidths.current = [];
            draw(data, columns, {column: order ? order[0] : 0, asc: order ? order[1] === 'asc' : true}, 1);
        }

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
        }
    }, [data, order, columns]);

    function pageList(x, max, maxView){
        const overflow = max > maxView;

        if (overflow){
            if (x < maxView) return [2, 3, 4];
            else if (x >= maxView && x <= max - maxView + 1) return [x - 1, x, x + 1];
            else return [max - 3, max - 2, max - 1]
        }

        else return Array.from({length: max}, (v, i) => i + 1);
    }

    return(
        <>
        <div className="tableWrapper">
            <div className="tableHeader">
                <div className="button_wrap">
                    {options && options.button ? options.button.map((x, idx) => <div className="tableButton" key={idx}>{x}</div>) : ""}
                </div>
                {
                    options && options.search == false ? "" : 
                    <div className="input_wrap">
                        <h1 className="filterText">{options && options.language && options.language.search ? options.language.search : "Search: "}</h1>
                        <input type="text"
                            className="filterInput"
                            onInput={(e) => {
                                filter(e, data, columns, sortMethod, page);
                            }}
                        />
                    </div>
                }
            </div>
            <table className={`dataTable ${className}`}>
                <colgroup>
                    {columns.map((col, idx) => (
                        <col key={idx} data-dt-column={idx}></col>
                    ))}
                </colgroup>
                <thead>
                    <tr>
                        {columns.map((col, idx) => {
                            if (col.hidden) return "";
                            else return (
                                <th className={`${col.className ? col.className : ""} ${col.orderable === false ? "" : "dt-column-orderable"} ${col.orderable != false && sortMethod.column == idx ? "dt-column-ordered" : ""} ${(col.orderable != false && sortMethod.column == idx) ? (sortMethod.asc ? "dt-column-ordered-asc" : "dt-column-ordered-desc") : ""}`}
                                    key={idx}
                                    data-dt-column={idx}
                                    onClick={() => {
                                        if (col.orderable === false) return;

                                        if (sortMethod.column == idx) draw(data, columns, {column: idx, asc: !sortMethod.asc}, 1);
                                        else draw(data, columns, {column: idx, asc: true}, 1);
                                    }}
                                    ref={el => thRef.current[idx] = el}>
                                    <span className="dt-column-title">{col.data}</span>
                                    <span className="dt-column-order"></span>
                                </th>);
                        })}
                    </tr>
                </thead>
                <tbody>
                    {viewData.length == 0 ?
                    <tr className="dt-no-result">
                        <td className="" colSpan={columns.length}>No Data</td>
                    </tr> :
                    viewData.map((row, idx) => (
                        <tr key={idx}>{
                            row.map((item, iidx) => {
                                if (!columns[iidx]) return "";

                                if (columns[iidx].hidden) return "";
                                else return (
                                    <td key={iidx}
                                        className={`${columns[iidx] ? (columns[iidx].className ? columns[iidx].className : "") : ""}`}>
                                        {item}</td>);
                                })
                        }</tr>
                    ))}
                </tbody>
            </table>
            <div className="tablePagination">
                {
                    options && options.pagination != false ? 
                    <Pagination>
                        <Pagination.Prev disabled={page <= 1} onClick={() => { if (page > 1) draw(filteredData, columns, sortMethod, page - 1)}} />
                        {
                            maxPage > maxViewPage - 1 ? <>
                                <Pagination.Item active={page == 1} onClick={() => { draw(filteredData, columns, sortMethod, 1)}} >{1}</Pagination.Item>
                                {page >= maxViewPage - 1 ? <Pagination.Ellipsis /> : ""}
                                {
                                    pageList(page, maxPage, maxViewPage - 1).map((x, idx) => <Pagination.Item key={idx}
                                                                                active={x == page}
                                                                                onClick={() => {draw(filteredData, columns, sortMethod, x)}}>
                                                                                {x}
                                                                </Pagination.Item>)
                                }
                                {page <= maxPage - maxViewPage + 2 ? <Pagination.Ellipsis /> : ""}
                                <Pagination.Item active={page == maxPage} onClick={() => { draw(filteredData, columns, sortMethod, maxPage)}}>{maxPage}</Pagination.Item>
                            </>
                            : <>
                                {
                                    pageList(page, maxPage, maxViewPage).map((x, idx) => <Pagination.Item key={idx}
                                                                                active={x == page}
                                                                                onClick={() => {draw(filteredData, columns, sortMethod, x)}}>
                                                                                {x}
                                                                </Pagination.Item>)
                                }
                            </>
                        }
                        <Pagination.Next disabled={page >= maxPage} onClick={() => { if (page < maxPage) draw(filteredData, columns, sortMethod, page + 1)}} />
                    </Pagination> : ""
                }
            </div>
        </div>
        </>
    )
}

export default DataTable;