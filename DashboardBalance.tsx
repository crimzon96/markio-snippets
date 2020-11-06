type Imodal = {
    modalIsOpen: boolean;
}

const DashboardBalance: FunctionComponent = ({ }) => {

    const [balanceStates, setBalanceStates] = useState({

    })

    const [ModalState, setModalState] = useState<Imodal>({
        modalIsOpen: false
    })

    const [errorModalState, setErrorModalState] = useState({
        modalIsOpen: false
    })

    const ErrorBalanceModalListener = (boolean) => {
        setModalState({modalIsOpen: false})
        setErrorModalState({modalIsOpen: true})
    }

    const modalListener = (boolean) => {

        setModalState({ modalIsOpen: !boolean })
    }
    if (ModalState.modalIsOpen || errorModalState.modalIsOpen){
        document.body.addEventListener('click', function (event) {
            if (event.target.className === 'modal fade show') {
                setModalState({ modalIsOpen: false })
                setErrorModalState({modalIsOpen: false})
            }
        });
    }

    useEffect(() => {
        axios(
            "/api/dashboard-balance/"
        )
            .then(function (response) {
                setBalanceStates(response.data);
            })
            .catch(function (error) {
            })
    }, []);
    return (

        <>
            {balanceStates ?
                <>
                    { balanceStates.balance && balanceStates.balance > 0 ?
                    <>
                    <DashboardBalanceWithdrawModal modalIsOpen={ModalState.modalIsOpen} ErrorBalanceModalListener={ErrorBalanceModalListener}></DashboardBalanceWithdrawModal>
                    <DashboardErrorModal modalIsOpen={errorModalState.modalIsOpen}/>
                    </>
                    : null
                    }
                    <div className="row">
                        <div className="col-md-6 col-lg-12 col-xl-6">
                            <InComeTracker />
                        </div>
                        <div className="col-md-6 col-lg-12 col-xl-6">
                            <div className="card mb-4">
                                <div style={{ backgroundColor: '#6724fa' }} className="card-header">
                                    <h4 style={{ float: 'left', margin: '0px' }} className="text-white">
                                        <i className="fas fa-balance-scale-right text-white"></i>&nbsp;
                                    Balance
                            </h4>
                                    <h4 style={{ float: 'right', margin: '0px', fontWeight: 'bold' }} className="text-white">$ {balanceStates.balance || 0}</h4>

                                </div>
                                <div className="card-body container">
                                    <div className="row dashboard_balance__row">
                                        <span className="col-8">Available to pay out</span>
                                        <span className="col-4 text-right" style={{ fontSize: '16px' }}>$ {balanceStates.available_payout || 0}</span>
                                    </div>
                                    <div className="row dashboard_balance__row">
                                        <span className="col-8">Will be available soon (Pending)</span>
                                        <span className="col-4 text-right">$ {balanceStates.pending || 0}</span>
                                    </div>
                                    <div className="row dashboard_balance__row">
                                        <span className="col-8">Last payout</span>
                                        <span className="col-4 text-right">$ {balanceStates.last_payout || 0}</span>
                                    </div>

                                </div>
                                { balanceStates.balance && balanceStates.balance > 0 ?
                                <>
                                <div className="card-footer d-block text-center text-body small font-weight-semibold">
                                    <button className="btn btn-dark-purple" onClick={() => modalListener(ModalState.modalIsOpen)}>
                                        Withdraw Funds
                                </button>
                                </div>
                                </>
                                :           <>
                                <div className="card-footer d-block text-center text-body small font-weight-semibold">
                                    <div className="btn btn-dark-purple btn-dark-purple--opactiy">
                                        Withdraw Funds
                                </div>
                                </div>
                                </> }
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-lg-12 col-xl-6">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h4 style={{ float: 'left', margin: '0px' }} className="">
                                        <i className="fas fa-university"></i>&nbsp;
                                    Operations
                                </h4>

                                </div>
                                <div className="card-body container balance--container">
                                    {balanceStates && balanceStates.operations && balanceStates.operations.length > 0 ?
                                    <>
                                    {balanceStates.operations.map(item => (
                                        <DashboardBalanceOperation key={item.index} item={item}/>)
                                    )}
                                    </>
                                    : <h4>No operations yet..</h4>
                                    }
                                </div>
                                <div className="card-footer d-block text-center text-body small font-weight-semibold">

                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-12 col-xl-6">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h4 style={{ float: 'left', margin: '0px' }} className="">
                                        <i className="fas fa-university"></i>&nbsp;
                                    Bank account & Cards
                                </h4>

                                </div>
                                <div className="card-body container">
                                    <div className="row dashboard_balance__row dashboard_balance__row--operating">

                                        <div className="text-center">
                                            <i className="fas fa-university date icon fa-5x"></i>

                                        </div>
                                        <div className="title">
                                            <span className="block">Test Bank</span>
                                            <span>123324 1231244 231232</span>
                                        </div>
                                        <div className="container__amount">
                                            <span className="amount text-right">Activated</span>
                                        </div>
                                    </div>

                                </div>
                                <div className="card-footer d-block text-center text-body small font-weight-semibold">

                                </div>
                            </div>
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h4 style={{ float: 'left', margin: '0px' }} className="">
                                        <i className="fas fa-hand-holding-usd"></i>&nbsp;
                                    Invoice
                                </h4>

                                </div>
                                <div className="card-body container balance--container">
                                    { balanceStates && balanceStates.invoices && balanceStates.invoices.length > 0 ?
                                    <>
                                    {balanceStates.invoices.map(
                                        item => (<DashboardBalanceInvoice key={item.index} item={item} />)
                                    )}
                                    </>
                                    : <h4>No invoices yet...</h4>
                                    }
                                </div>
                                <div className="card-footer d-block text-center text-body small font-weight-semibold">

                                </div>
                            </div>
                        </div>
                    </div>
                </> : <div className="loader"></div>}

        </>
    )
}
export default DashboardBalance;
