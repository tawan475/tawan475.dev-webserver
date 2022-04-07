const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const cloudflareIpProcessor = require('../libs/logger');
const logger = require('../libs/logger');

module.exports = (app) => {
    app.use((req, res, next) => {
        res.setHeader('X-Powered-By', 'tawan475');

        if (req.socket.localAddress !== req.socket.remoteAddress) {
            if (!req.subdomains.length && req.headers.host != 'tawan475.dev') {
                return res.redirect(301, 'https://tawan475.dev' + req.url);
            }

            if (!req.secure) {
                return res.redirect(301, 'https://' + req.headers.host + req.url);
            }

            if (req.get('host').indexOf('www.') === 0 && (req.method === "GET" && !req.xhr)) {
                return res.redirect(req.protocol + '://' + req.get('host').substring(4) + req.originalUrl);
            }
        };

        next()
    })

    app.use(cloudflareIpProcessor)
    app.use(logger);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(require('express-minify-html-2')({
        override: true,
        htmlMinifier: {
            caseSensitive: true,
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            minifyJS: true,
            trimCustomFragments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            html5: true,
            decodeEntities: true,
            minifyCSS: true,
            processConditionalComments: true,
            removeAttributeQuotes: true,
            useShortDoctype: true,
            removeStyleLinkTypeAttributes: true
        }
    }));

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(compression());
}