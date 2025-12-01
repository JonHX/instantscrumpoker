# AWS API Gateway WebSocket Cost Analysis

## Current Implementation

The application properly handles WebSocket connections with the following cost-saving measures:

### ✅ Connection Management (Implemented)

1. **Automatic Disconnection on Component Unmount**
   - Location: `components/poker-room.tsx` lines 247-252
   - The WebSocket cleanup function properly closes connections when users leave the room or close the browser
   ```typescript
   return () => {
     if (wsRef.current) {
       wsRef.current.close()
       wsRef.current = null
     }
   }
   ```

2. **Server-Side Disconnect Handler**
   - Location: `lambda/handlers/websocket/disconnect.ts`
   - Automatically removes connection records from DynamoDB when connections close
   - Reduces storage costs by cleaning up stale connection data

3. **Stale Connection Cleanup**
   - Location: `lambda/lib/websocket.ts` lines 55-68
   - Handles 410 Gone errors (disconnected clients) during broadcasts
   - Automatically deletes stale connections from database

4. **TTL on Connections**
   - Location: `lambda/handlers/websocket/connect.ts` line 18
   - Connections expire after 1 day via DynamoDB TTL
   - Prevents accumulation of orphaned connection records

## AWS API Gateway WebSocket Pricing (2024)

### Connection Costs
- **Connection Minutes**: $0.25 per million connection minutes
  - First 1B connection minutes/month: $0.25/million
  - Next 9B connection minutes/month: $0.125/million
  - Over 10B connection minutes/month: $0.07/million

### Message Costs  
- **Messages**: $1.00 per million messages (sent or received)
  - First 1B messages/month: $1.00/million
  - Over 1B messages/month: $0.80/million

### Example Cost Calculation

**Scenario: 100 concurrent users, 4-hour scrum poker session**
- Connection time: 100 users × 240 minutes = 24,000 connection minutes
- Cost: 24,000 ÷ 1,000,000 × $0.25 = **$0.006**

**Messages (per session)**:
- Join: 100 messages
- Votes: ~500 messages (5 votes per user average)
- Reveals: ~50 messages
- Next estimate: ~50 messages
- Total: ~700 messages
- Cost: 700 ÷ 1,000,000 × $1.00 = **$0.0007**

**Total per session: ~$0.007** (less than 1 cent)

### Monthly Cost Estimate

**Assuming 1,000 sessions/month:**
- Connection cost: $6.00
- Message cost: $0.70
- **Total: ~$6.70/month**

## Cost Optimization Recommendations

### ✅ Already Implemented
1. ✅ Proper connection cleanup on disconnect
2. ✅ TTL on connection records
3. ✅ Stale connection removal during broadcasts
4. ✅ Efficient message broadcasting (Promise.allSettled)

### Additional Optimizations (Optional)
1. **Connection pooling**: Reuse connections for the same user across tabs
2. **Heartbeat messages**: Could add periodic pings to detect disconnected clients earlier
3. **Message batching**: Combine multiple updates into single broadcast (currently not needed)
4. **CloudWatch alarms**: Monitor connection/message metrics to catch anomalies

## Conclusion

**The current WebSocket implementation is cost-efficient:**
- Proper cleanup prevents orphaned connections
- Costs are minimal (~$0.007 per session)
- No significant optimizations needed at current scale
- Will scale linearly with usage ($6-10/month for 1,000 sessions)

The disconnect handlers are working correctly and saving money by:
- Closing connections when users leave
- Removing stale connection data
- Preventing unnecessary message delivery attempts

