## تغییر چیست؟ / What changed?

<!-- توضیح کوتاه: چه چیزی را و چرا تغییر داده‌اید؟ / Short description: what did you change and why? -->

## نوع تغییر / Type of change

- [ ] اصلاح داده (غلط تایپی/OCR، پیش‌نیاز، واحد و …) در `data/*.json` / Data fix in `data/*.json`
- [ ] رفع باگ / Bug fix
- [ ] ویژگی جدید یا بهبود ظاهر / New feature or UI improvement
- [ ] مستندات / Documentation

## چک‌لیست / Checklist

- [ ] پروژه را با سرور محلی اجرا و تست کردم (`python3 -m http.server 8000`) / I ran and tested the project locally
- [ ] `node scripts/validate-data.js` بدون خطا اجرا می‌شود / `node scripts/validate-data.js` passes
- [ ] اگر درس یا خوشه اضافه/حذف کردم، `node scripts/generate-sitemap.js` را اجرا و `sitemap.xml` را کامیت کردم / If I added/removed a course or cluster, I regenerated and committed `sitemap.xml`
- [ ] اگر داده‌ی درسی را اصلاح کردم، با `files/curriculum.pdf` مقابله کردم (شماره‌ی صفحه را بنویسید) / If I fixed course data, I checked it against `files/curriculum.pdf` (add the page number)
- [ ] هر متن آزادی که به `innerHTML` می‌دهم با `esc(...)` پوشانده شده است / Any free text I pass to `innerHTML` is wrapped with `esc(...)`
