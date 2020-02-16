'use strict'

/**
 * This file is part of Ark Core - Detective.
 *
 * (c) deadlock
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const SDC = require('@fiverr/statsd-client')
const defaults = require('./defaults')
const appmetrics = require('appmetrics')

/**
 * The struct used by the plugin container.
 * @type {Object}
 */
exports.plugin = {
    pkg: require('../package.json'),
    defaults,
    alias: 'deadlock:core-stats',
    async register (container, options) {
        const logger = container.resolvePlugin('logger')
        if (!options.enabled) {
            return
        }

        if (!options.host) {
            logger.warning('[Core Stats] Host not set, make sure you have set the configuration')
            return
        }

        logger.debug('[Core Stats] Up and running')

        const client = new SDC({
            host: options.host,
            port: options.port || 8125,
            scheme: 'graphite',
            prefix: options.statsPrefix || 'test',
            errorHandler: (error, data) => console.error(error, data)
        })

        const monitor = appmetrics.monitor()

        monitor.on('cpu', function handle (cpu) {
            client.gauge('cpu.process', cpu.process)
            client.gauge('cpu.system', cpu.system)
        })

        monitor.on('memory', function handle (memory) {
            client.gauge('memory.process.private', memory.private)
            client.gauge('memory.process.physical', memory.physical)
            client.gauge('memory.process.virtual', memory.virtual)
            client.gauge('memory.system.used', memory.physical_used)
            client.gauge('memory.system.total', memory.physical_total)
        })

        monitor.on('eventloop', function handle (eventloop) {
            client.gauge('eventloop.latency.min', eventloop.latency.min)
            client.gauge('eventloop.latency.max', eventloop.latency.max)
            client.gauge('eventloop.latency.avg', eventloop.latency.avg)
        })

        monitor.on('gc', function handle (gc) {
            client.gauge('gc.size', gc.size)
            client.gauge('gc.used', gc.used)
            client.time('gc.duration', gc.duration)
        })

        monitor.on('http', function handle (http) {
            client.time('http', http.duration)
        })

        monitor.on('socketio', function handle (socketio) {
            client.time('socketio.' + socketio.method + '.' + socketio.event, socketio.duration)
        })

        monitor.on('leveldown', function handle (leveldown) {
            client.time('leveldown', leveldown.duration)
        })

        // not working because pg-promise doesn't wrap the underlying PG module in a way appmetrics
        // would understand
        // monitor.on('postgres', function handle (postgres) {
        //     client.time('postgres', postgres.duration)
        // })
    }
}
