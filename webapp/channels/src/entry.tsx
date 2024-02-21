// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';

import {logError} from 'mattermost-redux/actions/errors';

import store from 'stores/redux_store';

import App from 'components/app';

import {AnnouncementBarTypes} from 'utils/constants';
import {setCSRFFromCookie} from 'utils/utils';

// Import our styles
import './sass/styles.scss';
import 'katex/dist/katex.min.css';

import '@mattermost/compass-icons/css/compass-icons.css';
import '@mattermost/components/dist/index.esm.css';
import * as GlobalActions from 'actions/global_actions';

declare global {
    interface Window {
        publicPath?: string;
    }
}
// @ts-ignore
window.mm = null;
try{
    // @ts-ignore
    const processId = parseInt(window.location.search.match(/pid=([^&]*)/)[1], 10);
    // @ts-ignore
    const wid = parseInt(window.location.search.match(/wid=([^&]*)/)[1], 10);

    // @ts-ignore
    window.mm = {postMessage : function(...args) {
            // @ts-ignore
            window.top.postMessage({
                name: 'osjs/iframe:message',
                params: [{
                    pid: processId,
                    wid: wid,
                    args: Array.prototype.slice.call(args)
                }]
            }, '*');

        }};
}catch(err){
    console.log("Not running within Oxzion - ignoring");
}


// This is for anything that needs to be done for ALL react components.
// This runs before we start to render anything.
function preRenderSetup(callwhendone: () => void) {
    window.onerror = (msg, url, line, column, error) => {
        if (msg === 'ResizeObserver loop limit exceeded') {
            return;
        }

        store.dispatch(
            logError(
                {
                    type: AnnouncementBarTypes.DEVELOPER,
                    message: 'A JavaScript error in the webapp client has occurred. (msg: ' + msg + ', row: ' + line + ', col: ' + column + ').',
                    stack: error?.stack,
                    url,
                },
                true,
                true,
            ),
        );
    };
    setCSRFFromCookie();

    // @ts-ignore
    if(window.mm){
        // @ts-ignore
        window.mm.postMessage('Ping');
        window.addEventListener('message', (ev) => {
            const message = ev.data || {};
            let event = null;
            let text = '';
            switch (message) {
                case 'logout':
                    console.log("Case Logout");
                    GlobalActions.emitUserLoggedOutEvent();
                    break;
                // Anything else will just be logged to console
                default:
                    event = new window.CustomEvent(message.method, {detail: message});
                    window.dispatchEvent(event);
                    console.warn('[Chat] sent', message);
                    break;
            }
        });
    }
    // OXZION CHANGES END
    callwhendone();
}

function renderRootComponent() {
    ReactDOM.render((
        <App/>
    ),
    document.getElementById('root'));
}

/**
 * Adds a function to be invoked onload appended to any existing onload
 * event handlers.
 */
function appendOnLoadEvent(fn: (evt: Event) => void) {
    if (window.onload) {
        const curronload = window.onload;
        window.onload = (evt) => {
            (curronload as any)(evt);
            fn(evt);
        };
    } else {
        window.onload = fn;
    }
}

appendOnLoadEvent(() => {
    // Do the pre-render setup and call renderRootComponent when done
    preRenderSetup(renderRootComponent);
});
