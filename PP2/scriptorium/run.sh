#!/bin/bash

echo "Starting server:"
npm install
npx prisma generate
npm run dev
node -v