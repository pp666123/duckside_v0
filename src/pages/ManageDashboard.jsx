/* * * * * 人豪 * * * * * 
 * 
 * 
 * * * * * * * * * * * */

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import dt from 'date-and-time';
import { h } from "gridjs";

import MyCurrentPosition, { MyCardDeck } from '../components/ManageCurrent.jsx';
import ManageRecent from '../components/ManageRecent.jsx';
import { MyChartPie } from '../components/MyChartComponent.jsx'
import { MyCandleLookup } from '../components/MyLookupComponent.jsx'
import Breadcrumb from '../components/Breadcrumb'

const acc_email = localStorage.getItem('loginState');
const dateQuery = dt.format(new Date(), 'YYYY-MM-DD');
const urlPostAsset = 'https://still-scrubland-65207.herokuapp.com/asset/someday';
const urlPostInventory = 'https://still-scrubland-65207.herokuapp.com/dashboard/inventory';
const urlPostPlan = 'https://still-scrubland-65207.herokuapp.com/dashboard/plan';

// 庫存現況表設定
const colInventory = [
   { id: 'sec_id', name: '代號', width: '10%' },
   { id: 'sec_name', name: '名稱', width: '12%' },
   {
      id: 'total', name: h('b', { style: { 'float': 'right', } }, '庫存'), width: '12%',
      formatter: (cell) => h('b', { style: { 'float': 'right', } }, cell.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
   },
   {
      id: 'marketPrice', name: h('b', { style: { 'float': 'right', } }, '現價'), width: '10%',
      formatter: (cell) => h('span', { style: { 'float': 'right', } }, cell.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
   },
   {
      id: 'marketPriceChange', name: h('b', { style: { 'float': 'right', 'font-size': '15px' } }, '漲跌'), width: '10%',
      formatter: (cell) => h('span', { style: { 'float': 'right', 'color': cell > 0 ? 'rgb(255,96,96)' : 'rgb(108,196,108)' } }, cell)
   },
   {
      id: 'marketPriceChangePct', name: h('b', { style: { 'float': 'right', 'font-size': '15px' } }, '漲跌幅'), width: '10%',
      formatter: (cell, row) => h('span', { style: { 'float': 'right', 'color': cell > 0 ? 'rgb(255,96,96)' : 'rgb(108,196,108)' } }, cell + '%')
   },
   {
      id: 'marketValue', name: h('b', { style: { 'float': 'right', } }, '市值'), width: '15%',
      formatter: (cell) => h('b', { style: { 'float': 'right', } }, cell.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
   },
];
// 最近計畫
const colPlan = [
   { id: 'plan_id', name: 'asd_id', hidden: true },
   {
      id: 'plan_date', name: '日期', width: '10%',
      formatter: (cell) => { let d = new Date(cell); return dt.format(d, 'M/D'); },
   },
   { id: 'sec_id', name: '代號', width: '12%' },
   { id: 'sec_name', name: '名稱', width: '15%' },
   { id: 'plan_strategy', name: '類型', hidden: true },
   { id: 'plan_param1', name: '參數', hidden: true },
   { id: 'plan_param2', name: '參數', hidden: true },
   {
      id: 'plan_anchor', name: '參考', width: '12%', formatter: (cell) => h('b', { style: { 'float': 'right', } }, cell.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
   },
   {
      id: 'plan_stoploss', name: '停損', width: '12%', formatter: (cell) => h('b', { style: { 'float': 'right', } }, cell.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
   },
   {
      id: 'plan_target', name: '目標', width: '12%',
      formatter: (cell) => h('b', { style: { 'float': 'right', } }, cell.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
   },
   {
      id: 'marketPrice', name: '現價', width: '12%',
      formatter: (cell) => h('b', { style: { 'float': 'right', } }, cell.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
   },
   { id: 'plan_note', name: '筆記', width: '15%' },
];

function ManageDashboard(props) {
   const [dataCard, setDataCard] = useState([]);
   const [dataPlan, setDataPlan] = useState([]);
   const [dataPosition, setDataPosition] = useState([]);

   useEffect(() => {
      let beingMounted = true;
      let dataToServer = {
         acc_email: acc_email,
         dateQuery: dateQuery,
      }
      if (acc_email) {
         axios.post(urlPostAsset, dataToServer).then((res) => {
            if (beingMounted) {
               let dataObj = res.data;
               let myAstSum = res.data.ast_sum;
               let myAstArr = [
                  { title: "總資產", value: dataObj.ast_sum },
                  { title: "現金", value: dataObj.ast_cash },
                  { title: "證券", value: dataObj.ast_securities },
                  { title: "資券", value: dataObj.ast_borrowing },
                  { title: "期權", value: dataObj.ast_option },
                  { title: "其他", value: dataObj.ast_others },
                  { title: "調整", value: dataObj.ast_adjust },
               ];
               let myAstCards = myAstArr.map((v) => (
                  {
                     weight: v.value / myAstSum,
                     ...v
                  }
               ));
               console.log(myAstCards);
               setDataCard(myAstCards);
            }
         });

         axios.post(urlPostInventory, dataToServer).then((res) => {
            if (beingMounted) {
               console.log(res.data);
               let dataSorted = res.data.map(v => v);
               dataSorted = dataSorted.sort(function (a, b) {
                  return a.marketValue < b.marketValue ? 1 : -1;
               });
               console.log(dataSorted);
               setDataPosition(dataSorted);
            }
         });

         axios.post(urlPostPlan, dataToServer).then((res) => {
            if (beingMounted) {
               console.log(res.data);
               setDataPlan(res.data);
            }
         });
      }

      return () => { beingMounted = false };
   }, []);

   return (
      <Container fluid className="pt-0">
         <Row>
            <Breadcrumb />
         </Row>
         <MyCardDeck data={dataCard} />
         <br />
         <Row>
            <Col lg={8}>
               <Tab.Container id="left-tabs-example" defaultActiveKey="first" mountOnEnter={true}>
                  <Nav variant="pills">
                     <Nav.Item>
                        <Nav.Link eventKey="first" bsPrefix='btn btn-light ml-1'>庫存現況</Nav.Link>
                     </Nav.Item>
                     <Nav.Item>
                        <Nav.Link eventKey="second" bsPrefix='btn btn-light ml-1'>最近計畫</Nav.Link>
                     </Nav.Item>
                     <Nav.Item className="flex-grow-1">
                        <Nav.Link eventKey="disabled" disabled bsPrefix='btn btn-basic ml-1'></Nav.Link>
                     </Nav.Item>
                     <Nav.Item className='pr-1'>
                        <MyCandleLookup btnColor="warning"></MyCandleLookup>
                     </Nav.Item>
                  </Nav>
                  <Tab.Content>
                     <Tab.Pane eventKey="first">
                        <MyCurrentPosition className={{ table: 'table table-sm' }}
                           data={dataPosition} col={colInventory}
                        ></MyCurrentPosition>
                     </Tab.Pane>
                     <Tab.Pane eventKey="second">
                        <ManageRecent row={10} col={colPlan} data={dataPlan}
                        ></ManageRecent>
                     </Tab.Pane>
                  </Tab.Content>
               </Tab.Container>
            </Col>
            <Col lg={4}>
               <MyChartPie
                  labels={dataPosition && dataPosition.map(v => v.sec_name)}
                  data={dataPosition && dataPosition.map((v, i) => v.marketValue)}
               />
            </Col>
         </Row>
      </Container >
   );
}

export default ManageDashboard;