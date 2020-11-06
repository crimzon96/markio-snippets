import React, { FunctionComponent, useEffect, useState } from "react";
import ProgressBar from "js/components/web/ProgressBar";
import { Line as LineBar } from 'react-chartjs-2';
import axios from 'axios';

import getCookie from "js/components/Cookie";
var csrftoken = getCookie("csrftoken");

interface ILine {
    timeframe: string
    label: string
    labels: Array<any>
    data: Array<any>,
    border_color: string,
    point_color: string,

}

interface IDatasets {
    labels: Array<string>
    datasets: Array<ILine>
}


const IncomeTracker: FunctionComponent = () => {

  const [incomeTrackerStates, setIncomeTrackerStates] = useState({

  })

  const [currentState, setCurrentState] = useState({

  })

    useEffect(() => {
        const fetchData = () => {
            axios.get("/api/income-tracker/").then(res => {
              setIncomeTrackerStates(res.data);
              setCurrentState({
                income_data: {
                labels: res.data.income_data.month.labels,
                datasets: res.data.income_data.month.datasets,
                },
                progress_bar_data: res.data.progress_bar_data.month
              })
            })
        };
        fetchData();
    }, [])

    const updateIncomeTracker = (variable) => {
      if (variable === "month") {
        setCurrentState({
          income_data: {
          labels: incomeTrackerStates.income_data.month.labels,
          datasets: incomeTrackerStates.income_data.month.datasets,
          },
          progress_bar_data: incomeTrackerStates.progress_bar_data.month
        })
      }
      if (variable === "week") {
        setCurrentState({
            income_data: {
            labels: incomeTrackerStates.income_data.week.labels,
            datasets: incomeTrackerStates.income_data.week.datasets,
            },
            progress_bar_data: incomeTrackerStates.progress_bar_data.week
          })
      }
    }



  return (
    <div className="card mb-4">
      <h5 className="card-header with-elements border-0 pt-3 pb-0">
        <span className="card-header-title">
        <i className="far fa-chart-bar"></i>&nbsp; Income
        </span>

        <div className="card-header-elements ml-auto">
          <div
            className="btn-group btn-group-sm btn-group-toggle"
            data-toggle="buttons"
          >
            <div onClick={() =>  updateIncomeTracker("week")} style={{width: "190px"}} className="btn btn-mobile btn-primary">Week</div>
            <div onClick={() =>  updateIncomeTracker("month")} style={{width: "190px"}} className="btn btn-mobile btn-secondary">Month</div>
          </div>
        </div>
      </h5>
      <hr className="border-light mb-0"></hr>
      <div className="row no-gutters row-bordered">
        <div className="d-flex col-md-8 col-lg-12 col-xl-8 align-items-center p-4">
                <LineBar
            data={currentState.income_data || {"labels": [], "datasets": []}}
            width={650}
            height={300}
            redraw={true}
            options={{
            maintainAspectRatio: false,
    }} />
        </div>
        <div className="col-md-4 col-lg-12 col-xl-4 px-4 pt-4">
        {currentState && currentState.progress_bar_data && currentState.progress_bar_data.length >= 1 ?
        <>
        {currentState.progress_bar_data.map((item, i) =>
          <ProgressBar
          key={i}
          percentage={item.percentage}
          placeholder={item.label}
          height={3}
          color={item.color}
        />

        )}
        </>
        :
        <span>Get youre first sale</span>
        }
        </div>
      </div>
    </div>
  );
};

export default IncomeTracker;
