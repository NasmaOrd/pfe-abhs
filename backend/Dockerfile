# backend/Dockerfile

FROM node:18

# Installer Python et dépendances
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install pandas gspread oauth2client watchdog

WORKDIR /app

# Copier package.json et package-lock.json dans /app
COPY package*.json ./

RUN npm install

# Copier tout le reste du backend dans /app
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
