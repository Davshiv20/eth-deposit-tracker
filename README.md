# Ethereum Deposit Tracker

This application tracks ETH deposits on the Beacon Deposit Contract for the Holesky testnet.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in a `.env` file:
   ```
   INFURA_URL='https://mainnet.infura.io/v3/30a65c4dfd4f476e93197df3b2c3b25a'
   MONGODB_URI='mongodb+srv://shivamdave2903:eNQZMXdSMLtFg3sm@cluster0.afrvr.mongodb.net/'
   METRICS_PORT=9101   
   TELEGRAM_CHAT_ID=1983562308
   TELEGRAM_BOT_TOKEN=7178919978:AAHjZTGt0Dpw0VH_Qyuz_9P3KAP7rBLliyI
   ```
4. Ensure MongoDB is running
5. Start the application: `node index.js`

## Usage

The application will automatically start tracking deposits once launched. It exposes metrics at `http://localhost:9101/metrics` which can be scraped by Prometheus for Grafana visualization.

## Architecture

- `src/index.js`: Entry point
- `src/services/`: Contains core logic for deposit tracking, database interactions, and notifications
- `src/models/`: Database schemas
- `src/utils/`: Utility functions and logging

## Error Handling

Errors are logged using Winston. Check the application logs for any issues.

## Metrics

- `eth_total_deposits`: Total number of deposits tracked
- `eth_total_amount_deposited`: Total amount of ETH deposited

## Extending the Application

- To add new features, create new services in the `src/services/` directory
- To modify the deposit schema, update `src/models/deposit.js`
- To add new metrics, update `src/services/metricsService.js`
