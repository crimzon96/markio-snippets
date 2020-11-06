import React, { useState, FunctionComponent, useEffect } from 'react';
import ProductFormDashboard from '@src/js/components/ecommerce/ProductTabSwitch'
import axios from 'axios';
import getCookie from '@src/js/components/Cookie';
var csrftoken = getCookie('csrftoken');

type IAddProductState = {
  name: string
}

type IProduct = {
  title: string;
  price: any;
  category: string;
  status: string;
  description: string;
  images: Array<ImageObject>;
  attributes: Array<IAttribute>;
}

type IAttribute = {
  key: any;
  id: any;
  attribute: string;
  value: string;
}

type ImageObject = {
  name: string;
  url: string;
  Blob: {
    size:any;
    slice: any;
    type: any;
  }
  obj: any;
  alt_text: string;
  id: string;
  key: string
}


const AddProductDashboard: FunctionComponent<{}> = () => {
  const [addProductState, setAddProductState] = useState<IAddProductState>({
    name: 'basic'
  })

  const [productState, setProductState] = useState<IProduct>({
    title: null,
    price: {
      excl_tax: 0,
      tax: 0,
      incl_tax: 0

    },
    category: "Snap",
    status: 'draft',
    description: null,
    images: [],
    attributes: [],
  })


  const [errorProductState, setErrorProductState] = useState({
    title: null,
    price: {
      excl_tax:null,
      tax:null
    }
  })


  const DisableSubmit = () => {
    if (productState.title == null){
      return true
    } else{
      return false
    }
  }

  const ButtonListener = (event: any) => {
    setAddProductState({
      name: event.target.name
    });
  };

  const activeButton = name => {

    if (addProductState.name === name) {
      return ' active bg-white';
    } else {
      return ''
    }
  };


  const productStatsSubmit = (event: any) => {

    event.preventDefault();
    let formData = new FormData()
    for (let name in productState) {
      if (name === "attributes") {
        let count = 0
        let attributes_list = []
        productState.attributes.forEach(function (item) {
          if (item && item.attribute && item.value) {
            attributes_list.push({ "attribute": item.attribute, "value": item.value, "key": item.key })
            count = count + 1
          }
        })
        formData.append('attributes', JSON.stringify(attributes_list))
      } else if (name === "images") {
        productState.images.forEach(function (item) {

          formData.append('images', item, item.name)
        })
      } else if (name === "price") {
        formData.append('price', JSON.stringify({ excl_tax: productState.price.excl_tax, tax: productState.price.tax, incl_tax: productState.price.incl_tax }))
      } else {
        formData.append(name, productState[name])
      }
    }


    const errorHandler = (data: any) =>{
      for (let [data_key, data_value] of Object.entries(data)) {
        if (typeof(data_value[0]) === "string" ){
          setErrorProductState({
            ...errorProductState, [data_key]: data_value[0]})
        } else if (typeof(data_value) === "object") {

          for (let [key, value] of Object.entries(data_value)) {


            setErrorProductState(oldstate =>{
              let price = oldstate.price;
              price[key] = value[0]
              let r = {
                ...oldstate,
                price: price
              };
              return r
            })
        }}

        }

    }


    axios({
      method: 'post',
      url: '/api/products/',
      headers: {
        'X-CSRFToken': csrftoken
      },
      data: formData
    })
      .then(function (response) {
        // console.log(response)
      })
      .catch(function (error) {
        //handle error
        const data = error.response.data
        errorHandler(data)
      });
  }

  useEffect(() => {
    DisableSubmit();
  }, [productState]);

  return (
    <form>
      <h4 className="font-weight-bold py-3 mb-4">
        Add product
        </h4>
      <div className="nav-tabs-top nav-responsive-sm">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button onClick={ButtonListener}
              className={"nav-link" + activeButton('base')}
              name="base"
              data-toggle="tab"
              style={{ backgroundColor: 'whitesmoke' }}
            >
              Base info
                        </button>
          </li>
          <li className="nav-item">
            <button onClick={ButtonListener}
              className={"nav-link" + activeButton('attributes')}
              name="attributes"
              data-toggle="tab"
              style={{ backgroundColor: 'whitesmoke' }}
            >
              Attributes
                        </button>
          </li>
          <li className="nav-item">
            <button onClick={ButtonListener}
              className={"nav-link" + activeButton('images')}
              name="images"
              data-toggle="tab"
              style={{ backgroundColor: 'whitesmoke' }}
            >
              Images
              </button>
          </li>
        </ul>
      </div>

      <div className="card-body bg-white">
        <ProductFormDashboard
          formName={addProductState.name || ""}
          productState={productState}
          setProductState={setProductState}
          errorProductState={errorProductState}
        >
        </ProductFormDashboard>
      </div>
      <div className="" style={{ float: 'right' }}>
      <button type="button" className="btn btn-primary"
        onClick={productStatsSubmit}
      >Save changes</button>
    </div>
    </form>

  )
}

export default AddProductDashboard
