# Spilo - Android Native Mobile App 📱

სრულფასოვანი **Android Studio / Kotlin** მობილური აპლიკაცია **Spilo** ონლაინ მაღაზიისთვის.

* **Package ID:** `ge.spilo.app`
* **Target SDK:** Android 14 / 15 (API Level 34/35)
* **Web Engine Target:** `https://v3.animeb.ge`
* **Framework:** Android Native (Kotlin + AndroidX + ViewBinding + Modern WebView + Material 3)

---

## ✨ ფუნქციონალი

1. **Native Splash Screen:** აპლიკაციის ჩატვირთვის ეკრანი Spilo-ს ლოგოთი.
2. **Pull-to-Refresh:** ეკრანის ჩამოწევით გვერდის განახლება (SwipeRefreshLayout).
3. **Progress Bar:** გვერდის ჩატვირთვის ინდიკატორი ზედა ნაწილში (ნარინჯისფერი აქცენტით).
4. **Offline Error View:** ინტერნეტის გათიშვის შემთხვევაში ლამაზი ქართულენოვანი ეკრანი და "თავიდან ცდა" (Retry) ღილაკი.
5. **Back Navigation:** ტელეფონის "უკან" ღილაკით საიტის გვერდებზე დაბრუნება (Predictive Back Handler).
6. **File & Image Upload:** კამერიდან ან გალერეიდან სურათების/ფაილების ატვირთვის სრული მხარდაჭერა (`onShowFileChooser`).
7. **External Intents:** `tel:`, `mailto:`, `whatsapp:`, `viber:` ლინკების გადამისამართება შესაბამის აპლიკაციებში.
8. **Google Play Store Ready:** `.aab` (Android App Bundle) და `.apk` ფორმატების მხარდაჭერა.

---

## 🚀 როგორ გავხსნათ და ავაწყოთ `.apk` / `.aab`

### ვარიანტი 1: Android Studio-ში (რეკომენდებული)

1. ჩამოტვირთეთ და გახსენით უფასო [Android Studio](https://developer.android.com/studio).
2. აირჩიეთ **Open Project** და მონიშნეთ ეს ფოლდერი: `spilo-android`.
3. დაელოდეთ Gradle სინქრონიზაციას (Sync).
4. **ტელეფონზე დასაყენებელი `.apk`-ის ასაწყობად:**
   * ზედა მენიუში დააჭირეთ: **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   * პროცესის დასრულების შემდეგ დააჭირეთ **locate** და გექნებათ მზა `app-debug.apk`.
5. **Google Play Store-ისთვის `.aab`-ის ასაწყობად:**
   * ზედა მენიუში: **Build** -> **Generate Signed Bundle / APK** -> **Android App Bundle**.
   * შექმენით თქვენი ახალი Keystore (გასაღები) და დააგენერირეთ Release Bundle.

---

### ვარიანტი 2: ავტომატური ბილდი ღრუბელში (GitHub Actions)

თუ თქვენს კომპიუტერში არ გაქვთ დაინსტალირებული Android Studio ან Java, პროექტში უკვე ჩაშენებულია **GitHub Actions** სამუშაო პროცესი (`.github/workflows/build-apk.yml`):

1. ატვირთეთ პროექტი თქვენს GitHub რეპოზიტორიაში.
2. გადადით GitHub-ის ტაბზე: **Actions** -> **Build Android APK & AAB**.
3. 2 წუთში პროექტი ავტომატურად დაგენერირდება და Artifacts განყოფილებიდან პირდაპირ გადმოწერთ მზა **`.apk`** და **`.aab`** ფაილებს!

---

## 🎨 ფერები და ბრენდინგი

* `brand_orange`: `#FF5238`
* `brand_dark`: `#1D1D1F`
* `brand_bg`: `#FFFFFF`
* `brand_surface`: `#F9FAFB`

ყველა რესურსი და ტექსტი შეგიძლიათ შეცვალოთ `app/src/main/res/values/strings.xml` და `colors.xml` ფაილებში.
