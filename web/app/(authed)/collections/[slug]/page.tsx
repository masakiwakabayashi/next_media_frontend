import CollectionDetail from '@/features/collections/components/CollectionDetail'

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div className="min-h-screen font-sans">
      <CollectionDetail collectionSlug={slug} />
    </div>
  )
}
