# Proforma Fatura Yönetim Sistemi - Backend

Node.js/Express ile yazılmış Proforma Fatura Yönetim Sistemi backend API'si.

## Kurulum

```bash
npm install
```

## Ortam Değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env
```

## Çalıştırma

```bash
npm start
```

## API Endpoints

- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/customers` - Müşteri listesi
- `GET /api/products` - Ürün listesi
- `GET /api/invoices` - Fatura listesi
- `GET /api/settings` - Firma ayarları

## Teknolojiler

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- Puppeteer (PDF oluşturma)
