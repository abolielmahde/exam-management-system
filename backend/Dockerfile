# Image של שרת ה-Backend. מתקין Dependencies של Production ומפעיל את Express.
# בסיס קטן עם Node.js 20.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
# מתקינים רק חבילות Production כדי להקטין את ה-Image.
RUN npm install --omit=dev --no-audit --no-fund
COPY src ./src
COPY sql ./sql
EXPOSE 5001
# הפעלת נקודת הכניסה של Express.
CMD ["node", "src/server.js"]
