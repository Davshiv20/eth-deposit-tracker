# Ethereum Deposit Tracker

This application tracks ETH deposits on the Beacon Deposit Contract for the Holesky testnet. It's built with Node.js and containerized using Docker for easy deployment and scalability.

## Architecture

- `src/index.js`: Entry point
- `src/services/`: Core logic for deposit tracking, database interactions, and notifications
- `src/models/`: Database schemas
- `src/utils/`: Utility functions and logging

The application uses:
- Web3.js for Ethereum interaction
- MongoDB for data storage
- Prometheus for metrics collection
- Grafana for metrics visualization
- Telegram for notifications

## Prerequisites

- Docker
- Docker Compose

## Setup and Running

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/eth-deposit-tracker.git
   cd eth-deposit-tracker
   ```

2. Create a `.env` file in the project root with the following content:
   ```
   INFURA_URL=https://holesky.infura.io/v3/YOUR_PROJECT_ID
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

3. Build and start the containers:
   ```
   docker-compose up --build
   ```

This command will start the following services:
- Ethereum Deposit Tracker application
- MongoDB
- Prometheus
- Grafana
- Node Exporter (for system metrics)

## Accessing the Application

- Ethereum Deposit Tracker metrics: http://localhost:9101/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (default login: admin/admin)

## Configuration

The application can be configured through environment variables in the `docker-compose.yml` file or the `.env` file.

## Metrics

- `eth_total_deposits`: Total number of deposits tracked
- `eth_total_amount_deposited`: Total amount of ETH deposited

Additional system metrics are available through Node Exporter.

## Grafana Dashboard

1. Access Grafana at http://localhost:3001
2. Add Prometheus as a data source (URL: http://prometheus:9090)
3. Import the provided dashboard JSON or create custom dashboards

## Error Handling and Logging

Errors are logged using Winston. Check the application logs using:
```
docker-compose logs eth_deposit_tracker
```

## Extending the Application

- Add new features by creating services in `src/services/`
- Modify the deposit schema in `src/models/deposit.js`
- Add new metrics in `src/services/metricsService.js`

## Development

For local development without Docker:
1. Install dependencies: `npm install`
2. Ensure MongoDB is running locally
3. Set up environment variables in a `.env` file
4. Start the application: `node src/index.js`

## Testing

Run tests using:
```
npm test
```

## Deployment

For production deployment:
1. Ensure all sensitive information is stored securely (not in the repository)
2. Update the `docker-compose.yml` file with production-ready settings
3. Use a reverse proxy (like Nginx) for added security
4. Set up proper monitoring and alerting

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.