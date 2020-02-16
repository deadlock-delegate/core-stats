# Ark Core Stats Plugin


## Installation

Install the plugin: `yarn global add @deadlock-delegate/core-stats`

Open `~/.config/ark-core/{mainnet|devnet|testnet}/plugins.js` and add the following at at least after the logger package:
```js
"@deadlock-delegate/core-stats": {
    enabled: true,
    host: "<your statsd server host>",
    port: <your statsd server port>,
    prefix: "test",
},
```

## License

[MIT](LICENSE) © deadlock
