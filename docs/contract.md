# QueueSmart - System Architecture & API Contract Specification

**Base API Path:** `/api/v1`  
**WebSocket Server:** Socket.IO v4 (Redis Adapter in production)  
**Authentication Standard:** Bearer JWT in `Authorization` header (`Authorization: Bearer <access_token>`)  
**Standard Response Envelope:**
```json
{
  "success": true,
  "data": { ... },
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE",
    "details": null
  }
}
```

---

## 1. Core Entities & Database Schema

### Enums
- **UserRole:** `CITIZEN`, `STAFF`, `ADMIN`
- **CounterStatus:** `OPEN`, `BREAK`, `CLOSED`
- **AppointmentStatus:** `BOOKED`, `CHECKED_IN`, `IN_SERVICE`, `COMPLETED`, `NO_SHOW`, `CANCELLED`
- **TicketType:** `WALKIN`, `APPOINTMENT`
- **PriorityTier:** `NORMAL`, `SENIOR`, `DISABLED`, `PREGNANT`, `EMERGENCY`
- **TicketStatus:** `WAITING`, `CALLED`, `SERVING`, `DONE`, `SKIPPED`
- **NotificationType:** `INFO`, `SUCCESS`, `WARNING`, `ALERT`

### Entity Definitions
1. **Organization:** `id`, `name`, `code` (unique), `type` (`CLINIC` | `BANK` | `SERVICE_CENTER` | `COLLEGE`), `createdAt`, `updatedAt`
2. **Branch:** `id`, `organizationId`, `name`, `address`, `city`, `phone`, `latitude`, `longitude`, `operatingHours` (JSON: open, close, lunchStart, lunchEnd, workingDays), `createdAt`, `updatedAt`
3. **Service:** `id`, `branchId`, `name`, `description`, `avgDurationMin`, `priorityAllowed` (bool), `slaMinutes`, `category`, `isActive`, `createdAt`, `updatedAt`
4. **Counter:** `id`, `branchId`, `counterNumber`, `name`, `status`, `servicesOffered` (array of service IDs), `currentTicketId`, `staffUserId`, `servingStartedAt`, `createdAt`, `updatedAt`
5. **User:** `id`, `email` (unique), `passwordHash`, `name`, `phone`, `role`, `organizationId` (nullable), `branchId` (nullable), `refreshTokenHash` (nullable), `createdAt`, `updatedAt`
6. **Appointment:** `id`, `userId`, `userName`, `userPhone`, `userEmail`, `serviceId`, `branchId`, `counterId` (nullable), `slotStart`, `slotEnd`, `status`, `notes`, `qrCode`, `isGroup`, `groupSize`, `priorityTier`, `createdAt`, `updatedAt`
7. **QueueTicket:** `id`, `tokenNo` (e.g., `A-101`), `type`, `priorityTier`, `status`, `etaMinutes`, `peopleAhead`, `joinedAt`, `calledAt`, `servingAt`, `completedAt`, `userId`, `userName`, `userPhone`, `serviceId`, `branchId`, `counterId`, `counterNumber`, `priorityReason`, `priorityProofUrl`, `isGroup`, `groupSize`, `reorderReason`, `createdAt`, `updatedAt`
8. **ServiceLog:** `id`, `ticketId`, `tokenNo`, `counterId`, `counterNumber`, `serviceId`, `startedAt`, `endedAt`, `durationMinutes`, `status`, `createdAt`
9. **Notification:** `id`, `userId`, `ticketId`, `title`, `message`, `type`, `read`, `channel` (`IN_APP` | `SMS` | `WHATSAPP` | `PUSH`), `createdAt`
10. **AuditLog:** `id`, `userId`, `userName`, `action`, `entity`, `entityId`, `details` (JSON), `ipAddress`, `createdAt`
11. **DeviceToken:** `id`, `token` (unique), `userId` (nullable), `deviceType` (`web` | `android` | `ios`), `createdAt`, `updatedAt`
12. **Holiday:** `id`, `branchId`, `date` (YYYY-MM-DD), `name`, `createdAt`
13. **BlockedSlot:** `id`, `branchId`, `serviceId` (nullable), `startTime`, `endTime`, `reason`, `createdAt`

---

## 2. REST API Endpoints

### A. Customer Endpoints (Base `/api/v1`)
Strictly for `CITIZEN` role (or unauthenticated where public). Admin/Staff tokens rejected.

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Citizen registration (`name, email, phone, password`) |
| `POST` | `/auth/login` | Public | Citizen login (`emailOrPhone, password`) -> returns `{ accessToken, refreshToken, user }` |
| `POST` | `/auth/refresh` | Public | Exchange refresh token for new access token |
| `GET` | `/branches` | Public | List all operational branches |
| `GET` | `/services?branchId` | Public | List services offered at a branch |
| `GET` | `/slots?serviceId&date` | Public | Dynamic slots computed from branch hours, duration, counter count, minus bookings/blocked slots |
| `POST` | `/appointments` | Citizen | Book appointment slot (double-booking prevented by serializable DB transaction) |
| `PATCH`| `/appointments/:id/cancel` | Citizen | Cancel appointment -> immediately triggers slot release to waiting users |
| `POST` | `/appointments/:id/swap` | Citizen | Reschedule/swap slot |
| `POST` | `/queue/join` | Citizen/Public | Join virtual walk-in queue with priority tier & group options |
| `GET` | `/queue/status/:ticketId` | Public | Poll/get real-time ticket position, ETA, and assigned counter |
| `POST` | `/queue/:ticketId/leave` | Public | Voluntarily leave virtual queue |
| `GET` | `/forecast?serviceId` | Public | Hourly crowd heatmap & best-time-to-visit recommendations |
| `GET` | `/maps/travel-time` | Public | Estimated transit duration and leave-by time based on distance |
| `POST` | `/notifications/device-token`| Public | Register web push device token |

### B. Admin & Staff Endpoints (Base `/api/v1/admin`)
Strictly for `STAFF` and `ADMIN` roles. Citizen tokens rejected (403 Forbidden).

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/admin/auth/login` | Public | Staff/Admin login (`email, password, role`) |
| `GET` | `/admin/counters?branchId` | Staff/Admin | List all counters and their current serving ticket |
| `PATCH`| `/admin/counters/:id` | Staff/Admin | Update counter status (`OPEN`, `BREAK`, `CLOSED`), services, staff |
| `POST` | `/admin/queue/call-next` | Staff/Admin | Call next eligible citizen for a counter, complete previous ticket |
| `POST` | `/admin/queue/:ticketId/skip`| Staff/Admin | Skip absent citizen (records reason) |
| `POST` | `/admin/queue/recall` | Staff/Admin | Re-broadcast audio announcement for unresponsive ticket |
| `POST` | `/admin/queue/transfer` | Staff/Admin | Transfer ticket to another counter/service |
| `PATCH`| `/admin/queue/:ticketId/reorder`| Staff/Admin| Manual queue reorder (mandatory audit reason required) |
| `POST` | `/admin/walkin` | Staff/Admin | Reception desk walk-in registration (returns printable token slip data) |
| `GET` | `/admin/services?branchId` | Staff/Admin | List services |
| `POST` | `/admin/services` | Admin | Create new clinical/desk service |
| `PATCH`| `/admin/services/:id` | Admin | Update service SLA, duration, priorityAllowed |
| `DELETE`| `/admin/services/:id` | Admin | Deactivate service |
| `GET` | `/admin/staff?branchId` | Admin | List staff members |
| `POST` | `/admin/staff` | Admin | Onboard new staff operator / specialist |
| `GET` | `/admin/schedule?branchId` | Staff/Admin | Get operating hours, holidays, blocked slots |
| `POST` | `/admin/schedule/block` | Staff/Admin | Block a time window from bookings |
| `POST` | `/admin/schedule/holidays`| Admin | Add branch holiday |
| `POST` | `/admin/appointments/bulk-reschedule`| Admin | Bulk reschedule all appointments for a staff/service absence |
| `GET` | `/admin/analytics?branchId`| Admin | Comprehensive analytics (Wait vs SLA, utilization, no-show rate) |
| `POST` | `/admin/simulate` | Admin | What-If queue capacity simulator (returns projected wait and SLA breach %) |
| `GET` | `/admin/system-health` | Admin | Live diagnostics (Postgres pool, Redis ping, socket client counts) |

---

## 3. Real-Time Socket.IO Specification

### Rooms:
- `branch:<branchId>` - General branch updates (queue numbers, counter changes)
- `ticket:<ticketId>` - Private room for citizen tracking live ticket
- `display:<branchId>` - Public lobby TV screens

### Events:
1. `queue:update` -> `{ branchId, serviceId?, totalWaiting, lastUpdated }`
2. `ticket:called` -> `{ ticketId, tokenNo, counterNumber, counterId, serviceName, userName, timestamp }`
3. `eta:updated` -> `{ ticketId, etaMinutes, peopleAhead, timestamp }`
4. `counter:status` -> `{ counterId, counterNumber, status, currentTicketId }`
5. `queue:alert` -> `{ branchId, type: 'SLA_WARNING' | 'OVERCROWDED', message, suggestedAction, timestamp }`
6. `display:announce` -> `{ tokenNo, counterNumber, serviceName, timestamp, speechText }`
