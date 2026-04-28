<!-- AI-generated: Claude Code (Anthropic) — https://claude.ai/claude-code
     Derived from static analysis of all router source files. Reviewed and validated by the project team. -->

# API Contract

## Overview

**Base URL:** `http://localhost:{PORT}/api`

All endpoints except `POST /authenticate` require a valid JWT token. Pass it in the `Authorization` request header. The SSE endpoint is the only exception — see [Real-Time Events](#real-time-events) for details.

### Authentication Header
```
Authorization: <token>
```

### Common Error Responses
| Status | Body | Condition |
|---|---|---|
| 400 | `{ "message": "Invalid token" }` | Token is malformed or expired |
| 401 | `{ "message": "Access denied. No token provided." }` | Authorization header missing |
| 403 | `{ "message": "Administrator access denied." }` | Valid token but user is not an admin |
| 500 | `{ "error": "Unexpected backend error" }` | Unhandled server exception |

---

## Data Types

### InventoryItem
```json
{
  "itemID": 1,
  "itemName": "PLA Filament",
  "categoryID": 1,
  "categoryName": "Filament",
  "quantity": 42,
  "lowThreshold": 10,
  "yoloLabels": ["filament_spool"],
  "cameraId": 1
}
```
`categoryID`, `categoryName`, `yoloLabels`, and `cameraId` are optional.

### ItemCategory
```json
{
  "categoryID": 1,
  "categoryName": "Filament",
  "units": "spools"
}
```

### Transaction
```json
{
  "transactionId": 101,
  "item_id": 1,
  "quantity": 42,
  "recorded_at": "2026-04-28T12:00:00.000Z"
}
```

### QuantitySnapshot _(item history)_
```json
{
  "quantity": 42,
  "recorded_at": "2026-04-28T12:00:00.000Z"
}
```

### ItemQuantitySnapshot _(all-item history)_
```json
{
  "item_id": 1,
  "quantity": 42,
  "recorded_at": "2026-04-28T12:00:00.000Z"
}
```

### EmailRecipient
```json
{
  "email": "jdoe@quinnipiac.edu",
  "alerts": true,
  "daily": false,
  "weekly": true
}
```

### User
```json
{
  "username": "jdoe",
  "hash": "<bcrypt hash>",
  "is_admin": false
}
```

---

## Authentication

### POST /authenticate
Validates credentials and returns a signed JWT token.

**Auth required:** No

**Request body:**
```json
{
  "username": "jdoe",
  "password": "secret"
}
```

**Responses:**
| Status | Body |
|---|---|
| 200 | `{ "token": "<jwt>", "isAdmin": false }` |
| 401 | `{ "message": "Invalid Credentials" }` |

The token expires after **24 hours**. The JWT payload contains `{ username, isAdmin }`.

---

### GET /authorized
Verifies that the provided token is valid for any authenticated user.

**Auth required:** User

**Responses:**
| Status | Body |
|---|---|
| 200 | `true` |

---

### GET /authorized-admin
Verifies that the provided token belongs to an admin user.

**Auth required:** Admin

**Responses:**
| Status | Body |
|---|---|
| 200 | `true` |

---

## Users

### GET /users
Returns all user accounts.

**Auth required:** User

**Responses:**
| Status | Body |
|---|---|
| 200 | `User[]` |

---

### GET /users/:id
Returns a single user by username. Note: `:id` is the username string, not a numeric ID.

**Auth required:** User

**Responses:**
| Status | Body |
|---|---|
| 200 | `User` |

---

## Inventory Items

### GET /items
Returns all inventory items.

**Auth required:** User

**Responses:**
| Status | Body |
|---|---|
| 200 | `InventoryItem[]` |

---

### GET /items/:id
Returns a single inventory item by its numeric ID.

**Auth required:** User

**Path parameter:** `:id` — integer `item_id`

**Responses:**
| Status | Body |
|---|---|
| 200 | `InventoryItem` |

---

### GET /items/history
Returns quantity snapshots for all items ordered by `recorded_at` ascending.

**Auth required:** User

**Responses:**
| Status | Body |
|---|---|
| 200 | `ItemQuantitySnapshot[]` |

---

### GET /items/:id/history
Returns quantity snapshots for a single item ordered by `recorded_at` ascending.

**Auth required:** User

**Path parameter:** `:id` — integer `item_id`

**Responses:**
| Status | Body |
|---|---|
| 200 | `QuantitySnapshot[]` |

---

### POST /items
Creates a new inventory item and writes an initial transaction snapshot.

**Auth required:** Admin

**Request body:**
```json
{
  "newItem": {
    "itemName": "PLA Filament",
    "categoryID": 1,
    "quantity": 50,
    "lowThreshold": 10,
    "yoloLabels": ["filament_spool"],
    "cameraId": 1
  }
}
```
`categoryID` or `categoryName` may be provided. `yoloLabels` and `cameraId` are optional. If `categoryID` is omitted, it is resolved from `categoryName` (Filament → 1, Wood → 2, Vinyl → 3, other → 99).

**Responses:**
| Status | Body |
|---|---|
| 200 | `InventoryItem` (the created item) |
| 500 | `{ "error": "<message>" }` |

---

### PUT /items/:id
Updates an existing inventory item and writes a transaction snapshot for the new quantity. If the new quantity is at or below `lowThreshold` and the previous quantity was above it, a low-stock alert email is sent to all subscribed recipients.

**Auth required:** User

**Path parameter:** `:id` — integer `item_id`

**Request body:**
```json
{
  "item": {
    "itemName": "PLA Filament",
    "categoryID": 1,
    "quantity": 8,
    "lowThreshold": 10,
    "yoloLabels": ["filament_spool"],
    "cameraId": 1
  }
}
```

**Responses:**
| Status | Body |
|---|---|
| 200 | `InventoryItem` (the updated item) |
| 500 | `{ "error": "<message>" }` |

---

### DELETE /items/:id
Deletes an inventory item and all of its transaction history.

**Auth required:** Admin

**Path parameter:** `:id` — integer `item_id`

**Responses:**
| Status | Body |
|---|---|
| 200 | `{ "success": true }` |

---

## Categories

### GET /category
Returns all item categories.

**Auth required:** User

**Responses:**
| Status | Body |
|---|---|
| 200 | `ItemCategory[]` |

---

### GET /category/:id
Returns a single category by its numeric ID.

**Auth required:** User

**Path parameter:** `:id` — integer `category_id`

**Responses:**
| Status | Body |
|---|---|
| 200 | `ItemCategory` |

---

### POST /category
Creates a new item category.

**Auth required:** Admin

**Request body:**
```json
{
  "newCategory": {
    "categoryName": "Resin",
    "units": "bottles"
  }
}
```

**Responses:**
| Status | Body |
|---|---|
| 200 | _(empty)_ |

---

## Notifications (Email Recipients)

### GET /notifications
Returns all email notification recipients.

**Auth required:** User

**Responses:**
| Status | Body |
|---|---|
| 200 | `EmailRecipient[]` |

---

### POST /notifications
Adds a new email notification recipient.

**Auth required:** Admin

**Request body:**
```json
{
  "email": {
    "email": "jdoe@quinnipiac.edu",
    "alerts": true,
    "daily": false,
    "weekly": true
  }
}
```

**Responses:**
| Status | Body |
|---|---|
| 200 | `EmailRecipient` (the created recipient) |

---

### PUT /notifications/:email
Updates the notification preferences for an existing recipient.

**Auth required:** Admin

**Path parameter:** `:email` — URL-encoded email address

**Request body:**
```json
{
  "email": {
    "email": "jdoe@quinnipiac.edu",
    "alerts": false,
    "daily": true,
    "weekly": true
  }
}
```

**Responses:**
| Status | Body |
|---|---|
| 200 | `{ "success": true }` |

---

### DELETE /notifications/:email
Removes an email recipient from the mailing list.

**Auth required:** Admin

**Path parameter:** `:email` — URL-encoded email address

**Responses:**
| Status | Body |
|---|---|
| 200 | `{ "success": true }` |

---

## Transactions

### GET /transactions
Returns all transaction records.

**Auth required:** User

**Responses:**
| Status | Body |
|---|---|
| 200 | `Transaction[]` |

---

### GET /transactions/:id
Returns a single transaction by its numeric ID.

**Auth required:** User

**Path parameter:** `:id` — integer `transaction_id`

**Responses:**
| Status | Body |
|---|---|
| 200 | `Transaction` |

---

## Real-Time Events

### GET /events
Opens a persistent Server-Sent Events stream. Because the browser's native `EventSource` API cannot send custom headers, the JWT is passed as a query parameter instead of the `Authorization` header.

**Auth required:** Token as query parameter

**Query parameter:** `?token=<jwt>`

**Response headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event types:**

| Event | Payload | Trigger |
|---|---|---|
| `inventory_change` | `{ "eventType": "INSERT"\|"UPDATE"\|"DELETE", "record": InventoryItem }` | Any insert, update, or delete on the `inventory_item` table |
| `transaction_insert` | `{ "item_id": 1, "quantity": 42, "recorded_at": "..." }` | New row inserted into the `transaction` table |

A comment frame (`: heartbeat`) is sent to all clients every 25 seconds to keep the connection alive through proxies and load balancers.

---

## Image Upload (Raspberry Pi)

### POST /upload-image
Accepts a camera image from the Raspberry Pi, queues it for YOLO inference, and automatically updates affected item quantities once inference completes. Inference is triggered immediately when 2 images are queued, or after a 30-second timeout if fewer arrive.

**Auth required:** Pi API key (`x-api-key` header)

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `image` | file | Camera image file |
| `camera_index` | string | Zero-based camera index (default `"0"`) |

**Responses:**
| Status | Body |
|---|---|
| 200 | `{ "message": "Image queued for inference", "file": "<filename>" }` |
| 400 | `{ "error": "No image provided" }` |
| 401 | `{ "message": "Unauthorized: Invalid Pi API Key" }` |
