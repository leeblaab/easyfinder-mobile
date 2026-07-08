import * as Linking from 'expo-linking';

/**
 * Parses incoming deep link URLs and routes them appropriately inside the app.
 * Supported paths:
 * - easyfinder://vendor/[slug]     -> Navigate to service provider page
 * - easyfinder://category/[slug]   -> Navigate to category list page
 * - easyfinder://search            -> Navigate to advanced search
 * - easyfinder://submit            -> Navigate to submit new provider form
 * - easyfinder://profile           -> Navigate to user profile screen
 */
export function handleDeepLink(url: string, router: { push: (path: string) => void }) {
  if (!url) return;
  
  try {
    const parsed = Linking.parse(url);
    const { path } = parsed;
    
    if (!path) return;
    
    // Clean up trailing/leading slashes from path
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/');
    
    if (segments[0] === 'vendor' && segments[1]) {
      router.push(`/vendor/${segments[1]}`);
    } else if (segments[0] === 'category' && segments[1]) {
      router.push(`/category/${segments[1]}`);
    } else if (segments[0] === 'search') {
      router.push('/search');
    } else if (segments[0] === 'submit') {
      router.push('/submit');
    } else if (segments[0] === 'profile') {
      router.push('/(tabs)/profile');
    }
  } catch (error) {
    console.error('Failed to process deep link URL:', error);
  }
}
