import { createFileRoute } from '@tanstack/react-router';
import { WishlistPage } from '@/components/passalong/wishlist';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route=createFileRoute('/wishlist')({head:()=>pageHead('My wishlist','Useful things and helping hands you are looking for, with preferences for distance, trusted connections, and condition.'),component:Page});
function Page(){return <AppShell><WishlistPage/></AppShell>;}