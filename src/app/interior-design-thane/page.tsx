import { AreaPage, areaMetadata } from "@/components/AreaPage";

const SLUG = "interior-design-thane";

export const metadata = areaMetadata(SLUG);

export default function Page() {
  return <AreaPage slug={SLUG} />;
}
