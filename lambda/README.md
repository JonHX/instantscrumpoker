# ScrumPoker Lambda Service

AWS Lambda functions for ScrumPoker backend using DynamoDB and WebSocket API Gateway.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build Lambda package:
```bash
./build-sam.sh
```

3. Build with SAM:
```bash
sam build
```

4. Deploy:
```bash
sam deploy --stack-name scrumpoker-stack --resolve-s3 --capabilities CAPABILITY_IAM --parameter-overrides Environment=dev
```

## Environment Variables

- `TABLE_NAME`: DynamoDB table name for rooms
- `CONNECTIONS_TABLE`: DynamoDB table name for WebSocket connections
- `WS_ENDPOINT`: WebSocket API endpoint (set automatically by SAM template)

## API Endpoints

- `POST /api/rooms` - Create a new room
- `GET /api/rooms/{roomId}` - Get room data
- `POST /api/rooms/{roomId}/join` - Join a room
- `POST /api/rooms/{roomId}/vote` - Submit a vote

## WebSocket Events

- `$connect` - Handle WebSocket connection
- `$disconnect` - Handle WebSocket disconnection
- `$default` - Handle WebSocket messages (subscribe to room)

## Room ID Format

Room IDs are generated as `{roomNameSlug}-{4CharCode}` (e.g., `sprint-25-a1b2`).

