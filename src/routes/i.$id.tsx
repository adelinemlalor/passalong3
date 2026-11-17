import { createFileRoute } from "@tanstack/react-router";
import { getItemPreview } from "@/lib/passalong/live.functions";
import { liveHead } from "@/lib/passalong/live-rules";
import { PublicItem } from "@/components/live/public-item";
export const Route = createFileRoute("/i/$id")({
  loader: ({ params }) => getItemPreview({ data: { id: params.id } }),
  head: ({ loaderData }) => {
    const head = liveHead(
      loaderData?.title ?? "Shared item",
      loaderData
        ? `${loaderData.condition} · Shared in ${loaderData.circle_name}. Join the circle to claim.`
        : "This shared item is no longer available.",
    );
    const image = loaderData?.photo_url;
    return {
      ...head,
      meta: [
        ...head.meta,
        ...(image?.startsWith("https://")
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  component: Page,
});
function Page() {
  const item = Route.useLoaderData(),
    { id } = Route.useParams();
  return <PublicItem item={item} id={id} />;
}
