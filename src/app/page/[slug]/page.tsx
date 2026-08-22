import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck, Truck, HelpCircle, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import type { Metadata } from "next";
import { constructMetadata, getSeoSettings } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await prisma.cMSPage.findFirst({
    where: { slug },
  }).catch(() => null);

  const fallback = DEFAULT_PAGES[slug];
  const title = pageData?.title || fallback?.title || slug;
  const description = fallback?.subtitle || `${title} - Spilo.ge ოფიციალური ინფორმაცია და წესები.`;

  const siteSeo = await getSeoSettings(slug);

  return constructMetadata({
    title: siteSeo.hasSpecificOverride ? siteSeo.title : title,
    description: siteSeo.hasSpecificOverride ? siteSeo.description : description,
    ogImage: siteSeo.ogImage,
    canonicalUrl: `/page/${slug}`,
  });

}


const DEFAULT_PAGES: Record<string, { title: string; subtitle: string; content: string }> = {
  about: {
    title: "ჩვენ შესახებ (About Spilo)",
    subtitle: "ინოვაციური ელექტრონული კომერციის პლატფორმა საქართველოში",
    content: `Spilo.ge არის თანამედროვე ონლაინ მაღაზია, რომელიც მომხმარებელს სთავაზობს უახლეს ტექნიკას, სმარტფონებს, ლეპტოპებსა და აქსესუარებს საუკეთესო ფასად.

ჩვენი მიზანია ონლაინ შოპინგი გავხადოთ მაქსიმალურად მარტივი, სწრაფი და სანდო. ჩვენ ვთანამშრომლობთ მსოფლიოს წამყვან ბრენდებთან და გთავაზობთ მხოლოდ ოფიციალურ, გარანტირებულ პროდუქციას.

რატომ Spilo?
• ოფიციალური საგარანტიო მომსახურება ყველა ტექნიკაზე
• 0%-იანი ონლაინ განვადება წამყვან ბანკებთან (TBC, Bank of Georgia)
• სწრაფი მიწოდება მთელი საქართველოს მასშტაბით
• პროფესიონალური მომხმარებელთა მხარდაჭერის გუნდი 24/7`,
  },
  delivery: {
    title: "მიწოდების პირობები & ტარიფები",
    subtitle: "სწრაფი და უსაფრთხო მიტანის სერვისი მთელ საქართველოში",
    content: `Spilo გთავაზობთ მოქნილ და სწრაფ მიწოდების სერვისს მთელი ქვეყნის მასშტაბით.

მიწოდების ტარიფები და ვადები:
• უფასო მიწოდება: 100 ₾-ზე მეტი ღირებულების შეკვეთებზე მიწოდება უფასოა!
• თბილისი (სტანდარტული): 5 ₾ — მიწოდება ხორციელდება 1-2 სამუშაო დღეში.
• ექსპრეს მიწოდება: 15 ₾ — შეკვეთის მიღება იმავე დღეს 2-3 საათში.
• რეგიონები: 10 ₾ — საქართველოს ყველა რეგიონში 2-3 სამუშაო დღეში.

შეკვეთის მიღებისას გთხოვთ გადაამოწმოთ ნივთის ვიზუალური მდგომარეობა კურიერის თანდასწრებით.`,
  },
  installments: {
    title: "0% ონლაინ განვადება",
    subtitle: "შეიძინეთ სასურველი ტექნიკა სახლიდან გაუსვლელად",
    content: `Spilo.ge-ზე შეგიძლიათ ისარგებლოთ 0%-იანი ონლაინ განვადებით წამყვან ქართულ ბანკებში:

პარტნიორი ბანკები:
1. TBC Bank — სწრაფი ონლაინ დამტკიცება 2 წუთში, 0% გაძვირება 3-დან 24 თვემდე.
2. Bank of Georgia (BOG) — მარტივი განვადება მობილბანკით, წინასწარი შენატანის გარეშე.
3. Space / Payze — მოქნილი ონლაინ განვადება.

როგორ შევიძინოთ განვადებით?
1. აირჩიეთ სასურველი პროდუქტი და გადადით შეკვეთის გვერდზე.
2. გადახდის მეთოდებში მონიშნეთ „0% ონლაინ განვადება“.
3. აირჩიეთ სასურველი ბანკი და გადადით განაცხადის შესავსებად.
4. დამტკიცების შემდეგ შეკვეთა დაუყოვნებლივ გადაეცემა კურიერს.`,
  },
  privacy: {
    title: "კონფიდენციალურობის პოლიტიკა",
    subtitle: "თქვენი პერსონალური მონაცემების დაცვის სტანდარტები",
    content: `Spilo.ge დიდ მნიშვნელობას ანიჭებს მომხმარებელთა პერსონალური მონაცემების უსაფრთხოებასა და კონფიდენციალურობას.

რა ინფორმაციას ვაგროვებთ?
• სახელი, გვარი, ტელეფონის ნომერი და ელექტრონული ფოსტის მისამართი
• მიწოდების მისამართი შეკვეთის შესასრულებლად
• ტრანზაქციების ისტორია

მონაცემთა დაცვა:
თქვენი საბანკო და ბარათის მონაცემები მუშავდება დაცული საბანკო პროტოკოლებით (SSL/TLS) და არ ინახება Spilo-ს სერვერებზე.
ჩვენ არასდროს გადავცემთ თქვენს პერსონალურ ინფორმაციას მესამე პირებს მარკეტინგული მიზნებისთვის.`,
  },
  terms: {
    title: "წესები და პირობები",
    subtitle: "Spilo.ge-ს გამოყენების სამართლებრივი რეგულაციები",
    content: `წინამდებარე წესები და პირობები არეგულირებს ვებგვერდით spilo.ge სარგებლობისა და პროდუქციის შეძენის პირობებს.

1. შეკვეთის გაფორმება:
მომხმარებელს შეუძლია შეკვეთის გაფორმება როგორც რეგისტრირებული, ისე სტუმრის სტატუსით. შეკვეთის გაფორმებისას მითითებული უნდა იყოს ზუსტი საკონტაქტო და მისამართის მონაცემები.

2. ფასები და გადახდა:
საიტზე მითითებული ყველა ფასი მოიცავს საქართველოს კანონმდებლობით გათვალისწინებულ დღგ-ს. გადახდა შესაძლებელია როგორც ბარათით, ისე ონლაინ განვადებით ან კურიერთან ნაღდი ანგარიშსწორებით.

3. პროდუქციის დაბრუნება:
მომხმარებელს უფლება აქვს დააბრუნოს შეძენილი ნივთი 14 კალენდარული დღის განმავლობაში, თუ პროდუქტს შენარჩუნებული აქვს პირვანდელი სასაქონლო სახე, ქარხნული შეფუთვა და არ აღენიშნება ექსპლუატაციის კვალი.`,
  },
};

export default async function CMSPageView({ params }: PageProps) {
  const { slug } = await params;

  let pageData = await prisma.cMSPage.findFirst({
    where: { slug },
  }).catch(() => null);

  const fallback = DEFAULT_PAGES[slug];

  if (!pageData && !fallback) {
    notFound();
  }

  const title = pageData?.title || fallback?.title || slug;
  const subtitle = fallback?.subtitle || "ინფორმაცია & წესები";
  const content = pageData?.content || fallback?.content || "";

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-6">

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>მთავარ გვერდზე დაბრუნება</span>
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
          <div className="border-b border-gray-100 pb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              <Info className="w-3.5 h-3.5" />
              <span>საინფორმაციო გვერდი</span>
            </div>
            <h1 className="text-2xl sm:text-3xl text-gray-900 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {subtitle}
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {content}
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <span>ბოლო განახლება: {new Date().toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" })}</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-600">ოფიციალური დოკუმენტი</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
