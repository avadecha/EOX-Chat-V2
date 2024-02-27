// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useEffect } from 'react';
import {hot} from 'react-hot-loader/root';
import {Provider} from 'react-redux';
import {Router, Route} from 'react-router-dom';

import store from 'stores/redux_store';

import {makeAsyncComponent} from 'components/async_load';
import CRTPostsChannelResetWatcher from 'components/threading/channel_threads/posts_channel_reset_watcher';

import {getHistory} from 'utils/browser_history';
const LazyRoot = React.lazy(() => import('components/root'));

const Root = makeAsyncComponent('Root', LazyRoot);

const App = () => {
    useEffect(() => {

        // This function will be called when the component mounts
        // Add your componentDidMount logic here
        // For example, you can fetch data, subscribe to events, etc.
        // Make sure to return a cleanup function if necessary
        // This cleanup function will be called when the component unmounts
        console.log("Inside useeffect");
        document.body.onclick = function(e){
            // @ts-ignore
            // @ts-ignore
            var tag = e.target.parentElement.tagName.toLowerCase();
            // @ts-ignore
            if(tag == 'a' && e.target.parentElement.hasAttribute("eoxapplication")){
                console.log("Eoxapplication link found")
                e.stopPropagation();
                e.preventDefault();
                // @ts-ignore
                window.mm.postMessage('Urlclick', {detail:{'appName' : e.target.parentElement.attributes.eoxapplication.value, 'fileId':e.target.parentElement.attributes[4].value} });
            }
        };
        return () => {
            // Your cleanup logic here

        };
    }, []);
    return (
        <Provider store={store}>
            <CRTPostsChannelResetWatcher/>
            <Router history={getHistory()}>
                <Route
                    path='/'
                    component={Root}
                />
            </Router>
        </Provider>
    );
};

export default hot(React.memo(App));
