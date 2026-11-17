import { Link } from '@tanstack/react-router';
import { ArrowLeft, FlaskConical, CalendarDays, Trophy, Play, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePassalong } from './state';
export function TestSettings(){
 const state=usePassalong();const s=state.testSettings;
 return <div className="flow-page test-settings-page">
  <div className="flow-top"><Button variant="ghost" size="icon" aria-label="Go back" asChild><Link to="/"><ArrowLeft/></Link></Button><span>TEST SETTINGS</span><span/></div>
  <div className="test-settings-intro"><FlaskConical size={26}/><h1>Switch versions between user tests</h1><p>These apply app-wide, right away, and are remembered on this device. Hidden from regular screens — long-press the passalong logo to get here.</p></div>
  <section className="test-setting-block">
   <div className="test-setting-head"><CalendarDays size={18}/><div><strong>Drop mode</strong><p>Post now: items go live immediately and Sunday is a weekly roundup. Hold for Sunday: the old behavior, where items wait for the Sunday release.</p></div></div>
   <div className="test-mode-options">
    <Button variant={s.dropMode==='now'?'secondary':'outline'} className="justify-start h-12" onClick={()=>state.setTestSetting('dropMode','now')}>Post now (default)</Button>
    <Button variant={s.dropMode==='hold'?'secondary':'outline'} className="justify-start h-12" onClick={()=>state.setTestSetting('dropMode','hold')}>Hold for Sunday</Button>
   </div>
  </section>
  <section className="test-setting-block">
   <label className="filter-option"><span className="test-setting-label"><Trophy size={18}/> Leaderboard and points<small className="block text-muted-foreground">Levels, streaks, points celebrations, and the Circle heroes leaderboard.</small></span><Switch aria-label="Leaderboard and points" checked={s.gamification} onCheckedChange={v=>state.setTestSetting('gamification',v)}/></label>
  </section>
  <section className="test-setting-block">
   <label className="filter-option"><span className="test-setting-label"><Play size={18}/> Guided demo button<small className="block text-muted-foreground">The little orange play button at the top of every screen.</small></span><Switch aria-label="Guided demo button" checked={s.demoButton} onCheckedChange={v=>state.setTestSetting('demoButton',v)}/></label>
  </section>
  <section className="test-setting-block">
   <label className="filter-option"><span className="test-setting-label"><MapPin size={18}/> Nearby outer ring<small className="block text-muted-foreground">Show distance on items from beyond your circles. Off by default.</small></span><Switch aria-label="Nearby outer ring" checked={s.nearby} onCheckedChange={v=>state.setTestSetting('nearby',v)}/></label>
  </section>
  <Button asChild className="flow-next"><Link to="/">Done</Link></Button>
 </div>;
}
