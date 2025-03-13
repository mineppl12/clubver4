import React from 'react';
import ReactDOM from 'react-dom/client';

import Provider from './provider';

import "./index.scss";
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('main')).render(
    <Provider />
);