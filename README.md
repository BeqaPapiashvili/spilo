# Spilo

ქართული e-commerce პლატფორმა (Spilo.ge): კატალოგი, CMS მთავარი გვერდი, ადმინ პანელი, კალათა და შეკვეთები.

## გაშვება

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

დეველოპმენტი: [http://localhost:3000](http://localhost:3000)  
პროდაქშენის start სკრიპტი იყენებს პორტს **3002**.

## გარემოს ცვლადები

სავალდებულო პროდაქშენში:

- `DATABASE_URL`
- `JWT_SECRET` (მინიმუმ 32 სიმბოლო)

სურვილისამებრ:

- `NEXT_PUBLIC_SITE_URL` (ნაგულისხმევი `https://spilo.ge`)
- `RESEND_API_KEY`, `EMAIL_FROM`
- `SMS_OFFICE_API_KEY`, `SMS_SENDER_ID`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ADMIN_SEED_PASSWORD` — ადმინის შექმნა `prisma db seed`-ისას

გადახდა (United Payment, სატესტო BOG 3D):

- `UNITED_PAYMENT_DEALER_CODE` — სატესტო დილერი არის `2`
- `UNITED_PAYMENT_USERNAME` / `UNITED_PAYMENT_PASSWORD`
- `UNITED_PAYMENT_CHECK_KEY` — ზუსტად ის CheckKey, რაც United Payment-მა მოგცა
- `UNITED_PAYMENT_BANK_CODE` — ეს ბანკია, არა დილერი. ნაგულისხმევი `1` = Bank of Georgia
- `UNITED_PAYMENT_BASE_URL` (ნაგულისხმევი `https://service.unitedpayment.ge`)
- `UNITED_PAYMENT_REDIRECT_BASE` — სურვილისამებრ, callback-ის საჯარო origin

ბარათით გადახდა ჩექაუთზე გადამისამართებს United Payment-ის 3D გვერდზე. COD და გადარიცხვა იგივე რჩება.

## სკრიპტები

- `npm run dev` — dev სერვერი
- `npm run build` — პროდაქშენ ბილდი
- `npm start` — გაშვება პორტზე 3002
- `npm run lint` — ESLint
