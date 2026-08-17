# 🎒 Campus Lost & Found

A full-stack web application designed to help students report, search, claim, and manage lost and found items across a campus.

The system provides secure authentication, item reporting, image uploads, claim requests, notifications, status tracking, and admin controls.

---

## 🚀 Features

### 👤 Authentication
- User registration and login
- JWT-based authentication
- Protected dashboard routes
- Role-based access control
- Student and Admin roles

### 📦 Lost & Found Management
- Report lost items
- Report found items
- Upload item images
- View complete item details
- Search items
- Filter by type, category, and location
- Edit reported items
- Delete own reports

### 🤝 Claim Management
- Claim found items
- Submit a claim message as proof of ownership
- Prevent users from claiming their own items
- Prevent duplicate pending claims
- Item owner can approve or reject claims
- Automatically mark approved items as Claimed

### 🔔 Notification System
- Claim request notifications
- Claim approval notifications
- Claim rejection notifications
- Unread notification counter
- Mark individual notifications as read
- Mark all notifications as read
- Automatic notification refresh

### 📊 Dashboard
- Lost item statistics
- Found item statistics
- My Reports count
- Claim Requests section
- My Reports section
- Responsive dashboard

### 🔄 Item Status Workflow

```text
Lost / Found
     ↓
Claim Requested
     ↓
Claimed
     ↓
Returned
     ↓
Resolved