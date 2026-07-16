# BusPawa Flutter Mobile Apps

Three apps in one Flutter project:

## Apps

### 1. Conductor App (`lib/conductor/`)
- View trip manifest
- Mark passengers as boarded
- Confirm parcel handoff
- Generate trip summary

### 2. Booking Agent App (`lib/agent/`)
- Search available trips
- Create bookings
- Process M-Pesa payments
- Manage till sessions

### 3. Customer App (`lib/customer/`)
- Browse available trips
- Select seats
- Pay via M-Pesa
- Track booking status

## Setup

```bash
flutter create buspawa_mobile
cd buspawa_mobile
flutter pub add http flutter_dotenv provider
```

## Configuration

Create `.env` in `mobile/`:
```
API_URL=https://yourdomain.com/api
MPESA_SHORTCODE=your_shortcode
```

## Build

```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```
