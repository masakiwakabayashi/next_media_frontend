import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PostList from "@/features/posts/components/PostList";
import SearchForm from "@/features/posts/components/SearchForm";
import { makeQueryClient } from "@/lib/react-query";
import { postsQueryKey } from "@/features/posts/api/postsQuery";
import { getPostsPage } from "@/external/repositories/postRepository.server";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  // 1ページ目はサーバーで取得し、hydrate でクライアントのキャッシュに渡す。
  const queryClient = makeQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: postsQueryKey(q),
    queryFn: () => getPostsPage({ query: q }),
    initialPageParam: null,
  });

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 font-sans">
      <SearchForm defaultValue={q} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PostList query={q} />
      </HydrationBoundary>
    </div>
  );
}
