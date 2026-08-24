# Spilo - Apple iOS Native App 🍏📱

სრულფასოვანი **Apple iOS (Swift / Xcode)** მობილური აპლიკაცია **Spilo** ონლაინ მაღაზიისთვის iPhone და iPad მოწყობილობებისთვის.

* **Bundle ID:** `ge.spilo.app`
* **Deployment Target:** iOS 15.0+ (iOS 15, 16, 17, 18)
* **Web Engine Target:** `https://v3.animeb.ge`
* **Language & Framework:** Swift 5.0, UIKit + WKWebView + Network Framework

---

## ✨ ფუნქციონალი (iOS)

1. **iPhone Dynamic Island & Safe Area:** ეკრანის კიდეებთან და ჭრილებთან სრულყოფილი ადაპტაცია.
2. **Smooth Pull-to-Refresh:** ჩამოწევით განახლება Apple-ის ბუნებრივი ჰაპტიკური ვიბრაციით (`UIImpactFeedbackGenerator`).
3. **Progress View:** ზედა თხელი ნარინჯისფერი ზოლი (`#FF5238`) გვერდის ჩატვირთვის პროგრესისთვის.
4. **Native Offline Error View:** ინტერნეტის გათიშვისას ლამაზი ქართულენოვანი ეკრანი და "თავიდან ცდა" ღილაკი.
5. **Back/Forward Swipe Gestures:** ეკრანის გვერდიდან გასმით (Edge Swipe) გვერდებზე დაბრუნება/გადასვლა (`allowsBackForwardNavigationGestures`).
6. **External Scheme Routing:** `tel:`, `mailto:`, `whatsapp:`, `viber:` ლინკების პირდაპირ შესაბამის აპებში გახსნა.
7. **Apple App Store & TestFlight Ready:** ოფიციალური რელიზისთვის მომზადებული სტრუქტურა.

---

## 🚀 როგორ გავხსნათ და ავაწყოთ iOS აპლიკაცია

### ვარიანტი 1: Mac კომპიუტერზე (Xcode-ში)

1. გადაიტანეთ `spilo-ios` ფოლდერი Mac-ზე.
2. ორჯერ დააკლიკეთ **`Spilo.xcodeproj`** ფაილს (ავტომატურად გაიხსნება Xcode-ში).
3. **სიმულატორში ან თქვენს iPhone-ზე გასაშვებად:**
   * ზედა ზოლში აირჩიეთ ნებისმიერი მოწყობილობა (მაგ: *iPhone 16 Pro*).
   * დააჭირეთ **Play (▶️ Run)** ღილაკს (ან `Cmd + R`).
4. **App Store / TestFlight-ში ასატვირთად:**
   * ზედა მენიუში: **Product** -> **Archive**.
   * დასრულების შემდეგ: **Distribute App** -> **App Store Connect** / **TestFlight**.

---

### ვარიანტი 2: ავტომატური ბილდი ღრუბელში (GitHub Actions)

თუ Mac კომპიუტერი არ გაქვთ:
1. პროექტში უკვე ჩაშენებულია `.github/workflows/build-ios.yml`.
2. როგორც კი GitHub-ზე დაფუშავთ, GitHub-ის ვირტუალური macOS სერვერი ავტომატურად დააკომპილირებს და Actions ტაბიდან მოგცემთ მზა **`Spilo.ipa`** საინსტალაციო ფაილს.

---

## 📱 App Store-ის მოთხოვნები

Apple Developer Program-ში ($99/წელიწადში) რეგისტრაციის შემდეგ:
1. `AppIcon` (1024x1024) - მოთავსებულია `Assets.xcassets`-ში.
2. Privacy Permissions - გაწერილია `Info.plist`-ში ქართულად (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`).
