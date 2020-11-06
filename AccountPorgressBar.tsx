import React, { FunctionComponent, useEffect, useState } from 'react';
import axios from 'axios';

type Props = {
    percentage: number;
    placeholder: any,
    optional?: any;
    height?: number;
    color?: string;
}

const AccountProgressBar: FunctionComponent<Props> = () => {

    const [progressState, setProgressState] = useState({
        percentage: 0,
        missing: null,
        color: null,
        height: null

    })
    const [showProgressState, setShowProgressState] = useState({
        show: false
    })

    useEffect(() => {
        const fetchData = async () => {
            const vendorResults = await axios(
                '/api/account-progress/'
            );
            setProgressState(vendorResults.data);
            setShowProgressState({ "show": true })


        };
        fetchData();
    }, []);
    const accountState = () => {
        if (progressState.percentage !== 0 && progressState.percentage < 80) {
            return (
                <>
                    <h3>Complete account to get started</h3>
                    <ul>
                        {progressState.missing.map(miss => <li key={miss}>{miss}</li>)}
                    </ul>
                </>
            )
        } else if (progressState.percentage > 81  && progressState.percentage < 95) {
            return (
                <>
                    <h3>Almost there, but your'e still missing:</h3>
                    <ul>
                        {progressState.missing.map(miss => <li key={miss}>{miss}</li>)}
                    </ul>
                </>
            )
        }

    }

    return (
        <>
            {(showProgressState && progressState.percentage !== 0 && progressState.percentage < 96)  ?
                <>
                    {accountState()}
                    <div>
                        <div className="progress mb-4" style={{
                            height: `${progressState.height || 30}px`,
                        }}>
                            <div className="progress-bar" style={{
                                width: `${progressState.percentage || 0}%`,
                                height: `${250}px`,
                                backgroundColor: `${progressState.color || "#46DB4C"}`
                            }}>
                            </div>
                        </div>
                    </div>
                </>
                : null}
        </>

    )
}

export default AccountProgressBar;
