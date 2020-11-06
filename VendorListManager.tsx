import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';


import VendorList from './VendorList';
import VendorDetail from './VendorDetail';
import ProductDetail from '@src/js/components/productdetail/ProductDetail';


const NoMatchRoute = () => <div>404 Page</div>;
const VendorListManager = () => {
  return (
    <Router>
      <Switch>
        <Route path="/models/" exact component={VendorList} />
        <Route path="/models/:username/" exact component={VendorDetail} />
        <Route path="/models/:username/:slug/" exact component={ProductDetail} />
        <Route component={NoMatchRoute} />
      </Switch>
    </Router>
  );
};

export default VendorListManager;
