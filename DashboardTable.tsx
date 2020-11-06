import React, { FunctionComponent, useState, useEffect } from 'react';
import Select from '@src/js/components/web/Select'
import Search from '@src/js/components/web/Search'
import TableHead from 'js/components/dashboardtable/Tablehead'
import TableRow from 'js/components/dashboardtable/TableRow'
import axios from 'axios';
import Pagination from "@src/js/components/pagination/Pagination"

type IDashboardTable = {
    icon: string;
    icon_size: string;
    icon_color: string;
    title: string;
    api_url: string;
}

const data = [
    { label: "1", value: "1" },
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "50", value: "50" },
]

const DashboardTable: FunctionComponent<IDashboardTable> = ({ title, api_url, icon, icon_size, icon_color }) => {
    const [dashboardTableState, setDashboardTableState] = useState({
        next: null,
        previous: null,
        count: 0,
        num_pages: [],
        results: [],
        headers: [],
        url: null

    })


    const [orderingState, setOrderingState] = useState({
        order: null,
        sort: null,
    })

    const [showEntriesState, setShowEntriesState] = useState({
        show: 10
    })


    useEffect(() => {
        axios({
            method: 'get',
            url: api_url,
        })
            .then(function (response) {

                setDashboardTableState(response.data)

            })
            .catch(function (error) {
                // console.log(error)
            });
    }, []);

    const showEntries = (event) => {
        setShowEntriesState({ 'show': event.target.value })
        let url = null
        if (!dashboardTableState.url.includes("size") && !dashboardTableState.url.includes("ordering")) {
            url = api_url + '?size=' + event.target.value
        }
        else if (dashboardTableState.url && dashboardTableState.url.includes("ordering") && !dashboardTableState.url.includes("size")) {
            url = dashboardTableState.url + "&size=" + event.target.value
        } else if (dashboardTableState.url && dashboardTableState.url.includes("size")) {
            url = dashboardTableState.url.replace(/[0-9]+(?!.*[0-9])/, event.target.value)
        }
        axios({
            method: 'get',
            url: url,
        })
            .then(function (response) {
                setDashboardTableState(response.data)
            })

    }

    const paginateListener = (event: any) => {
        setDashboardTableState(oldstate => {
            let paginated_results = {
                ...oldstate,
                results: event.results

            };
            return paginated_results
        });
    }

    if (document.getElementById('search')) {
        let input = document.getElementById('search');
        // Init a timeout variable to be used below
        let timeout = null;
        // Listen for keystroke events
        input.addEventListener('blur', function (e) {
            clearTimeout(timeout);

            // Make a new timeout set to go off in 1000ms (1 second)
            timeout = setTimeout(function () {
                let url = null
                if (dashboardTableState.url && !dashboardTableState.url.includes("search")) {
                    url = dashboardTableState.url + '?search=' + input.value
                } else if (dashboardTableState && dashboardTableState.url.includes("search")) {
                    url = dashboardTableState.url.replace(/(?:search=)(\w+)/, input.value)
                }
                axios({
                    method: 'get',
                    url: url,
                })
                    .then(function (response) {
                        setDashboardTableState(response.data)
                    })
            }, 2000);

        });
    }

    const orderingListener = (event, order) => {
        setOrderingState(oldstate => ({ ...oldstate, ['order']: order }))
        let url = null
        if (order && !orderingState.order) {
            url = api_url + '?ordering=' + order

        } else if (orderingState.order === order) {
            if (!dashboardTableState.url.includes("-")) {
                url = dashboardTableState.url.replace(order, `-${order}`)
            }
            else {
                url = dashboardTableState.url.replace(`-${order}`, order)
            }
        } else if (dashboardTableState.url && orderingState.order) {
            url = dashboardTableState.url.replace(/(?:ordering=)(\w+)/, order)
        }
        axios({
            method: 'get',
            url: url
        })
            .then(function (response) {
                setDashboardTableState(response.data)
            })
    }

    return (
        <>
            {dashboardTableState.headers && dashboardTableState.results ?
                <div className="col-sm-12 col-xl-12">
                    <div className="card mb-4">
                        <div className="card-header" style={{ display: "flex" }}>
                            <h4 style={{
                                paddingRight: "10px",
                                marginBottom: "0px",
                                fontSize: "20px"
                            }}>{title}</h4>
                            {icon ?
                                <i
                                    className={`fas fa-${icon} fa-${icon_size}x icon-color--${icon_color}`}
                                    style={{ paddingTop: '5px' }}
                                ></i> :
                                null
                            }
                        </div>
                        <div className="card-body" style={{padding: '0px'}}>
                            <div className="row"
                                style={{margin: '15px', marginBottom: '0px'}}>
                                <div className="col-sm-6"
                                style={{padding: '0px'}}
                                >
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Select
                                                onChange={showEntries}
                                                name="show"
                                                label={null}
                                                options={data || []}
                                                selected={showEntriesState.show}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6"
                                style={{padding: '0px'}}
                                >
                                    <div className="row" style={{ justifyContent: 'flex-end' }}>
                                        <div className="col-sm-4">
                                            <Search
                                                placeholder={"Search"}
                                                aria_label={"search"}
                                            >
                                            </Search>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            {dashboardTableState.headers.map(
                                                header => (
                                                    <TableHead
                                                        key={header.name}
                                                        head={header.name}
                                                        verbose_name={header.verbose_name || header.name}
                                                        onClick={orderingListener}
                                                        sort={orderingState.sort || 'ascend'}
                                                    ></TableHead>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardTableState.results.map(
                                            (result, i) => (
                                                <TableRow
                                                    key={i}
                                                    columns={result}
                                                ></TableRow>
                                            )
                                        )
                                        }
                                    </tbody>
                                </table>
                            </div>

                        </div>
                        <div className="card-footer">
                            <div className="row">
                                <div
                                    className="col-sm-6"
                                    style={{
                                        margin: 'auto',
                                        width: '50%'
                                    }}
                                >
                                    <span>Showing 1 to {showEntriesState.show} of {dashboardTableState.count} entries</span>
                                </div>
                                <div className="col-sm-6"
                                    style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <Pagination
                                        paginateListener={paginateListener}
                                        api_url={api_url}

                                    ></Pagination>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                : null
            }
        </>
    )
}

export default DashboardTable;
