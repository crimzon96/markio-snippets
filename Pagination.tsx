import React, { FunctionComponent, useState, useEffect } from 'react';
import axios from 'axios';
import getCookie from 'js/components/Cookie';
var csrftoken = getCookie('csrftoken');

type Props = {
    paginateListener?: any;
    api_url: string;
};

const Pagination: FunctionComponent<Props> = ({paginateListener, api_url }) => {
	const [ PaginationStates, setPaginationStates ] = useState({
        data: null,
        page_item_active: 1,
	});

	useEffect(() => {
		const fetchData = () => {
			axios({
				method: 'get',
				url: api_url,
				headers: {
                    'X-CSRFToken': csrftoken,
				},
			}).then((res) => {
				setPaginationStates({
					...PaginationStates,
                    data: res.data,
                });
                paginateListener(res.data)
            });
		};
		fetchData();
	}, []);

	const previousList = () => {
        const previous = PaginationStates.data.links['previous']
        if (previous !== null) {
            axios({
                method: 'get',
                url: previous,
                headers: {
                    'X-CSRFToken': csrftoken
                },
            }).then((res) => {
				setPaginationStates({
					...PaginationStates,
                    data: res.data,
                    page_item_active: PaginationStates.page_item_active -1
            })
            paginateListener(res.data)
        });
        } else {
            null
        }
    };
    const nextList = () => {
        const next = PaginationStates.data.links['next']
        if (next !== null) {
            axios({
                method: 'get',
                url: next,
                headers: {
                    'X-CSRFToken': csrftoken
                },
            }).then((res) => {
				setPaginationStates({
					...PaginationStates,
                    data: res.data,
                    page_item_active: PaginationStates.page_item_active +1
            })
            paginateListener(res.data)
        });
        } else {
            null
        }
    };

    const pageItemListener = (page_number) => {
        axios({
            method: 'get',
            url: api_url +'?page=' + page_number,
            headers: {
                'X-CSRFToken': csrftoken
            },
        }).then((res) => {
            setPaginationStates({
                ...PaginationStates,
                data: res.data,
                page_item_active: page_number,
        })
        paginateListener(res.data)
    });

    }

    const pageItem = () => {
        return PaginationStates.data.num_pages.map(item => (
            <li key={item} onClick={() => pageItemListener(item)} className={`page-item ${PaginationStates.page_item_active === item ?
                'active': ''}`}>
                <div  className="page-link">
                    {item}
                </div>
            </li>
        ))

    }
	return (
        <>
        { PaginationStates.data ?
		<nav aria-label="Page navigation example">
			<ul className="pagination">
				<li className="page-item">
					<div onClick={previousList} className="page-link" aria-label="Previous">
						<span aria-hidden="true">&laquo;</span>
						<span className="sr-only">Previous</span>
					</div>
				</li>
                {pageItem()}
				<li className="page-item">
                    <div onClick={nextList} className="page-link" aria-label="Next">
						<span aria-hidden="true">&raquo;</span>
						<span className="sr-only">Next</span>
					</div>
				</li>
			</ul>
        </nav>
        : null
        }
        </>
	);
};

export default Pagination;
