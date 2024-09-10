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
   git clone [https://github.com/Davshiv20/eth-deposit-tracker]
   cd eth-deposit-tracker
   ```

2. Create a `.env` file in the project root with the following content:
   ```
   INFURA_URL=https://holesky.infura.io/v3/YOUR_PROJECT_ID
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   MONGODB_URI=mongodb://mongo:27017/eth_deposit_tracker
   GRAFANA_ADMIN_PASSWORD=your_secure_password
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

## Metrics and Visualization

### Prometheus Setup

1. Prometheus is pre-configured to scrape metrics from the Ethereum Deposit Tracker and Node Exporter.
2. Access the Prometheus UI at http://localhost:9090
3. To view available metrics:
   - Go to the Prometheus UI
   - Click on "Graph" in the top navigation
   - Alternative is skip the previous step and go directly to status and target, make sure the state is UP
   - Start typing in the "Expression" box to see available metrics

### Grafana Setup

1. Access Grafana at http://localhost:3001
2. Log in with the credentials (default: admin/admin)
3. Add Prometheus as a data source:
   - Go to Configuration > Data Sources
   - Click "Add data source"
   - Select "Prometheus"
   - Set the URL to `http://prometheus:9090`
   - Click "Save & Test"

4. Import the provided dashboard:
   - Go to Create > Import
   - Upload the JSON file from `grafana-dashboards/eth_deposit_dashboard.json`
   - Select the Prometheus data source you just created
   - Click "Import"

5. The dashboard includes panels for:
   - Total number of deposits
   - Total ETH deposited
   - Deposit rate over time
   - System metrics (CPU, Memory, Disk usage)

### Custom Metrics

- `eth_total_deposits`: Total number of deposits tracked
- `eth_total_amount_deposited`: Total amount of ETH deposited
- Additional system metrics are available through Node Exporter

To add custom metrics:
1. Define new metrics in `src/services/metricsService.js`
2. Use these metrics in your application code
3. They will automatically be exposed to Prometheus

## Data Handling

### Data Flow

1. The application listens for deposit events on the Holesky testnet
2. When a deposit is detected:
   - Event data is parsed and validated
   - Deposit details are saved to MongoDB
   - Metrics are updated
   - A Telegram notification is sent

### Database Schema

Deposits are stored in MongoDB with the following schema (defined in `src/models/deposit.js`):

```javascript
{
  blockNumber: Number,
  blockTimestamp: Number,
  transactionHash: String,
  logIndex: Number,
  senderAddress: String,
  amount: String,
  pubkey: String,
  withdrawalCredentials: String,
  signature: String,
  index: String
}
```

### Data Retention

- By default, all deposit data is retained indefinitely in MongoDB
- Implement a data retention policy if needed for long-term storage management

### Data Backup

- Regular backups of the MongoDB data are recommended
- Use MongoDB's built-in backup tools or set up automated backup scripts

## Error Handling and Logging

Errors are logged using Winston. Check the application logs using:
```
docker-compose logs eth_deposit_tracker
```

Log levels:
- `error`: Critical errors that need immediate attention
- `warn`: Warning conditions
- `info`: General information about application state
- `debug`: Detailed debugging information (disabled in production)

## Extending the Application

- Add new features by creating services in `src/services/`
- Modify the deposit schema in `src/models/deposit.js`
- Add new metrics in `src/services/metricsService.js`

## Dockerization

This project is fully dockerized for easy deployment and consistency across different environments. Here's an overview of the Docker setup:

### Docker Compose

We use Docker Compose to define and run multi-container Docker applications. The `docker-compose.yml` file in the root directory defines all the services required for this application.

### Dockerfile

The Dockerfile for the main application is located in the root directory. It defines how the eth_deposit_tracker image is built

### Volumes

Docker volumes are used for data persistence:

- `mongo-data`: Stores MongoDB data.
- `grafana-storage`: Stores Grafana configurations and dashboards.

### Environment Variables

Sensitive information and configuration options are managed through environment variables, defined in the `.env` file and referenced in `docker-compose.yml`.

### Building and Running

To build and start the application:

```bash
docker-compose up --build
```

To stop the application:

```bash
docker-compose down
```

### Accessing Container Logs

To view logs for a specific service:

```bash
docker-compose logs [service_name]
```

For example, to view logs of the main application:

```bash
docker-compose logs eth_deposit_tracker
```

### Scaling

To scale the main application (if needed):

```bash
docker-compose up --scale eth_deposit_tracker=3
```

This would run 3 instances of the eth_deposit_tracker service.

### Updating

To update the application with new changes:

1. Make your code changes
2. Rebuild the images: `docker-compose build`
3. Restart the services: `docker-compose up -d`
   
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

### Production Considerations

For production deployment:
- Use Docker secrets for managing sensitive information.
- Consider using Docker Swarm or Kubernetes for orchestration in a clustered environment.
- Implement health checks in the Dockerfile and docker-compose.yml.
- Use specific version tags for images instead of 'latest' to ensure consistency.

## Security Considerations

- Keep your `.env` file secure and never commit it to the repository
- Regularly update dependencies to patch security vulnerabilities
- Use strong, unique passwords for Grafana and other services
- Implement proper access controls for your MongoDB instance
- Consider using Docker secrets for managing sensitive information in a production environment

## Troubleshooting

- If metrics are not showing up in Grafana, check Prometheus targets and ensure they are in an "Up" state
- For database connection issues, verify the MongoDB connection string and ensure the database is accessible
- Check application logs for any error messages or warnings
