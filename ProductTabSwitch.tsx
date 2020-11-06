import React, { FunctionComponent } from "react";
import ProductBaseForm from 'js/components/ecommerce/ProductBaseForm'
import ProductAttributesForm from '@src/js/components/ecommerce/ProductAttributesForm'
import ProductImagesForm from '@src/js/components/ecommerce/ProductImagesForm'

type Props = {
  formName: string;
  productState?: any;
  setProductState?: any;
  errorProductState?: any;
};

const ProductTabSwitch: FunctionComponent<Props> = ({ formName, productState, setProductState, errorProductState}) => {


  switch (formName) {
    case "base":
      return <ProductBaseForm productState={productState} setProductState={setProductState} errorProductState={errorProductState} />;

    case "attributes":
      return <ProductAttributesForm productState={productState} setProductState={setProductState} errorProductState={errorProductState} />;

    case "images":
      return <ProductImagesForm productState={productState} setProductState={setProductState} errorProductState={errorProductState}/>;

    default:
      return <ProductBaseForm productState={productState} setProductState={setProductState} errorProductState={errorProductState} />;
  }
};

export default ProductTabSwitch;
