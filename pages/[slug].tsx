import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SlugRedirect() {
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (slug) router.replace(`/blog/${slug}`);
  }, [slug, router]);

  return null;
}
