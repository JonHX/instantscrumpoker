# ScrumPoker Lambda + DynamoDB Migration

This document describes the migration from Next.js API routes with Supabase to AWS Lambda + DynamoDB.

## Architecture

- **Frontend**: Next.js static export (S3 + Cloudflare recommended)
- **Backend**: AWS Lambda functions (Node.js/TypeScript)
- **Database**: DynamoDB (single-table design)
- **Real-time**: API Gateway WebSocket API
- **CI/CD**: CircleCI following onedam-poc patterns

## Key Changes

1. **Path-Based Routing**: `/rooms/{roomId}` instead of query parameters
2. **Room ID Format**: `{roomNameSlug}-{4CharCode}` instead of UUID
3. **Real-time Updates**: WebSocket instead of Supabase subscriptions
4. **Sharing**: Full path-based URLs in share links and QR codes

## Setup

### Lambda Deployment

1. Navigate to `lambda/` directory
2. Install dependencies: `npm install`
3. Build: `./build-sam.sh && sam build`
4. Deploy: `sam deploy --stack-name scrumpoker-stack --resolve-s3 --capabilities CAPABILITY_IAM`

### Frontend Configuration

Set environment variables:
- `NEXT_PUBLIC_API_BASE_URL`: HTTP API Gateway URL
- `NEXT_PUBLIC_WS_ENDPOINT`: WebSocket API Gateway URL

### Frontend Deployment

1. Build static export: `npm run build`
2. Deploy `out/` directory to S3 + Cloudflare (or Vercel)

## File Structure

- `lambda/` - Lambda service (SAM template, handlers, lib)
- `.circleci/config.yml` - CircleCI configuration
- `app/rooms/[roomId]/page.tsx` - Path-based room page
- `components/` - Updated for WebSocket and new routing

## Room ID Generation

Room IDs are human-readable: `{slug}-{code}` where:
- `slug`: URL-safe version of room name
- `code`: 4-character alphanumeric code

Example: "Sprint 25 Estimation" → `sprint-25-estimation-a1b2`

## WebSocket Events

- **vote**: Broadcast when someone votes
- **join**: Broadcast when someone joins

Frontend automatically reconnects on disconnect.

