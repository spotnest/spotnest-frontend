# SpotNest Frontend

This is the Next.js client for the SpotNest platform. It handles the UI for property discovery, owner/admin management, bookings, and Razorpay payments.

## Tech Stack

- Next.js 16
- TypeScript
- React 19
- TanStack Query
- Redux Toolkit
- Axios
- Socket.IO client

## Main Areas

- Auth flows and session initialization
- Property listing and owner dashboards
- Bookings and payment confirmation UI
- Admin and tenant management views
- Notifications and chat client

## Environment Variables

Create or update your .env file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Local Development

```bash
npm install
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## Payment Integration Notes

- Request to Rent creates a PENDING booking and does not start checkout
- Owners review requests from the existing bookings view
- Only an approved booking can pay its backend-calculated advance
- Monthly rent uses a separate Razorpay payment record for each billing month
- The backend verifies every payment before updating booking or rental status
- Razorpay's public key is returned by the backend with each order; no key is needed in the frontend environment

## Project Structure

```text
spotnest-frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── modules/
│   ├── providers/
│   ├── store/
│   └── types/
├── .env
├── .env.example
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```
