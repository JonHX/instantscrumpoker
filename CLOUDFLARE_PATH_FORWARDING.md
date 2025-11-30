# Cloudflare Path Forwarding Configuration

## How Cloudflare Forwards Paths

When you set up a CNAME with Cloudflare proxy (orange cloud ☁️), Cloudflare automatically forwards **all paths** to the target. You don't need to configure individual paths.

### Your Current Setup

```
CNAME: api → v4efb7cuy3.execute-api.eu-west-1.amazonaws.com (Proxied)
```

This means:
- `https://api.instantscrumpoker.com/api/rooms` → `https://v4efb7cuy3.execute-api.eu-west-1.amazonaws.com/api/rooms`
- `https://api.instantscrumpoker.com/api/rooms/{id}` → `https://v4efb7cuy3.execute-api.eu-west-1.amazonaws.com/api/rooms/{id}`
- `https://api.instantscrumpoker.com/api/rooms/{id}/join` → `https://v4efb7cuy3.execute-api.eu-west-1.amazonaws.com/api/rooms/{id}/join`
- All other paths are forwarded automatically

## Verifying Path Forwarding

### Test Script (PowerShell)

```powershell
$paths = @(
    '/api/rooms',
    '/api/rooms/test-123',
    '/api/rooms/test-123/join',
    '/api/rooms/test-123/vote',
    '/api/rooms/test-123/reveal'
)

foreach ($path in $paths) {
    $url = "https://api.instantscrumpoker.com$path"
    try {
        $response = Invoke-WebRequest -Uri $url -Method OPTIONS -Headers @{'Origin'='https://instantscrumpoker.com'}
        Write-Host "✅ $path - Status: $($response.StatusCode)"
    } catch {
        $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Error" }
        Write-Host "❌ $path - Status: $status"
    }
}
```

### Expected Results

**If Cloudflare is forwarding correctly:**
- ✅ All paths return 200/204 (OPTIONS) or appropriate status codes
- ✅ CORS headers are present
- ✅ Response comes from API Gateway (check `apigw-requestid` header)

**If Cloudflare is blocking:**
- ❌ 403 Forbidden with `{"message": "Forbidden"}` from Cloudflare
- ❌ No CORS headers
- ❌ No `apigw-requestid` header

**If path doesn't exist:**
- ❌ 404 Not Found with `{"message": "Not Found"}` from API Gateway
- ✅ CORS headers present (Lambda returned them)
- ✅ `apigw-requestid` header present

## Common Issues

### Issue 1: Cloudflare Firewall Blocking

**Symptom:** 403 Forbidden on all or specific paths

**Solution:**
1. Go to **Security → WAF → Custom Rules**
2. Check for rules blocking `/api/*`
3. Create allow rule:
   ```
   Rule: Allow API Paths
   Expression: (http.request.uri.path starts_with "/api/")
   Action: Allow
   ```

### Issue 2: Page Rules Interfering

**Symptom:** Some paths work, others don't

**Solution:**
1. Go to **Rules → Page Rules**
2. Check for rules matching `/api/*`
3. Ensure no rules are blocking or redirecting API paths

### Issue 3: SSL/TLS Mode Issues

**Symptom:** Connection errors or timeouts

**Solution:**
1. Go to **SSL/TLS → Overview**
2. Set SSL/TLS encryption mode to **Full** or **Full (Strict)**
3. **NOT** "Flexible" (breaks HTTPS)

## Cloudflare Settings That Affect Forwarding

### ✅ Automatic (No Configuration Needed)

- **Path forwarding:** All paths are forwarded automatically
- **Query parameters:** Forwarded automatically
- **Headers:** Most headers forwarded (except Cloudflare-specific ones)

### ⚙️ Settings to Check

1. **SSL/TLS Mode:** Must be **Full** or **Full (Strict)**
2. **Always Use HTTPS:** Should be **On**
3. **Automatic HTTPS Rewrites:** Can be **On**
4. **Browser Cache TTL:** Should be **Respect Existing Headers** (for API)

### 🔒 Security Settings

1. **Security Level:** Medium or Low (High may block legitimate requests)
2. **WAF:** Should allow `/api/*` paths
3. **Rate Limiting:** Configure if needed, but don't block OPTIONS

## Testing Path Forwarding

### Quick Test Commands

**PowerShell:**
```powershell
# Test root API path
Invoke-WebRequest -Uri 'https://api.instantscrumpoker.com/api/rooms' -Method OPTIONS

# Test nested path
Invoke-WebRequest -Uri 'https://api.instantscrumpoker.com/api/rooms/test-123/join' -Method OPTIONS
```

**cURL:**
```bash
# Test root API path
curl -X OPTIONS https://api.instantscrumpoker.com/api/rooms \
  -H "Origin: https://instantscrumpoker.com"

# Test nested path
curl -X OPTIONS https://api.instantscrumpoker.com/api/rooms/test-123/join \
  -H "Origin: https://instantscrumpoker.com"
```

### Check Response Headers

Look for these headers to confirm forwarding:

- ✅ `apigw-requestid` - Confirms request reached API Gateway
- ✅ `access-control-allow-origin` - Confirms Lambda returned CORS headers
- ❌ `cf-ray` - Present but doesn't mean blocking (Cloudflare always adds this)

## Summary

**Cloudflare automatically forwards all paths** when using a proxied CNAME. You don't need to configure individual paths.

**If paths aren't working:**
1. Check Cloudflare Firewall Rules (most common issue)
2. Check Page Rules
3. Verify SSL/TLS mode is Full/Full (Strict)
4. Test direct API Gateway URL to isolate Cloudflare vs API Gateway issues

