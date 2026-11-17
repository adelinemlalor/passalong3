import { features } from '@/lib/passalong/features';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { TestSettings } from '@/components/passalong/test-settings';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/test-settings')({ beforeLoad:()=>{if(!features.testSettings)throw redirect({to:'/'});},
 component: TestSettings,
 head: () => pageHead('Test settings · passalong', 'Hidden test settings for switching Passalong prototype versions between user tests.'),
});
