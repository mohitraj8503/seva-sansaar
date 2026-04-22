import { notFound } from "next/navigation";
import { BusinessDetailView } from "@/components/business/BusinessDetailView";
import { BusinessViewBeacon } from "@/components/business/BusinessContactTrackers";
import { getBusinessBySlug as getRegisteredBySlug } from "@/lib/server/businessStore";
import { getBusinessBySlug as getSeedBySlug } from "@/lib/businessData";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const biz = (await getRegisteredBySlug(slug)) || getSeedBySlug(slug);

  if (!biz) return { title: "Business Not Found | Seva Sansaar" };

  const name = biz.name;
  const category = biz.category;
  const city = biz.city;

  return {
    title: `${name} - Professional ${category} in ${city} | Seva Sansaar`,
    description: biz.description || `Verified ${category} service provider in ${city}. Book professional services on Seva Sansaar.`,
    openGraph: {
      title: name,
      description: biz.description || undefined,
      images: [
        ("photoUrls" in biz && biz.photoUrls && biz.photoUrls.length > 0 
          ? biz.photoUrls[0] 
          : "image" in biz && biz.image
            ? biz.image 
            : "/seva-logo.png"
        )
      ],
    },
  };
}

const PLACEHOLDER =
  "https://images.pexels.com/photos/21812143/pexels-photo-21812143.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reg = await getRegisteredBySlug(slug);

  const business =
    reg != null
      ? {
          id: reg.id,
          slug: reg.slug,
          name: reg.name,
          category: reg.category,
          locality: reg.locality,
          city: reg.city,
          description: reg.description,
          image: (reg.photoUrls && reg.photoUrls.length > 0) ? reg.photoUrls[0] : PLACEHOLDER,
          services: reg.services || [],
          serviceAreas: (reg.serviceAreas || []).map((a) => a.label),
          hours: reg.hours || "Consultation only",
          priceRange: reg.pricing || "Contact for pricing",
          verified: !!reg.verified,
          status: reg.status || "pending",
          whatsapp: reg.whatsapp || "",
          phone: reg.phone || "",
        }
      : (() => {
          const staticBiz = getSeedBySlug(slug);
          if (!staticBiz) notFound();
          return {
            ...staticBiz,
            id: staticBiz.slug,
          };
        })();

  return (
    <main className="min-h-screen bg-gray-50 py-24">
      {reg && <BusinessViewBeacon businessId={reg.id} />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BusinessDetailView business={business} />
      </div>
    </main>
  );
}
