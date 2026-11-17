import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Building2, Check, Copy, GraduationCap, Link2, LogOut, Plus, Share2, Sparkles, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePassalong } from './state';

export const circleTypes=['Friend group','Building','Class','Workplace','Other'];
const typeIcons:Record<string,typeof Users>={'Friend group':Users,Building:Building2,Class:GraduationCap,Workplace:Briefcase,Other:Sparkles};
export const inviteLink=(id:string)=>`passalong.app/join/${id}`;

export function InviteButtons({id,name}:{id:string;name:string}){
 const state=usePassalong();const [copied,setCopied]=useState(false);
 return <div className="invite-buttons"><Button variant="outline" onClick={()=>{setCopied(true);state.notify(`Invite link for ${name} copied — demo only, nothing sent.`);setTimeout(()=>setCopied(false),1800);}}>{copied?<><Check size={15}/> Copied</>:<><Copy size={15}/> Copy invite link</>}</Button><Button onClick={()=>state.notify(`Share sheet for ${name} would open here — demo only, nothing sent.`)}><Share2 size={15}/> Share link</Button></div>;
}

export function BringYourPeople(){
 const state=usePassalong();const [selected,setSelected]=useState(state.myCircles[0]?.id ?? '');
 const circle=state.myCircles.find(c=>c.id===selected) ?? state.myCircles[0];
 return <div className="bring-people"><p className="no-contacts"><Link2 size={14}/> No contacts uploaded. People join by link.</p>{state.myCircles.map(c=><Button key={c.id} variant="ghost" className={`category-chip ${selected===c.id?'category-active':''}`} onClick={()=>setSelected(c.id)}>{c.name}</Button>)}{circle&&<div className="invite-card"><span className="flow-icon circle-icon"><Users size={20}/></span><div className="flex-1"><strong>{circle.name}</strong><p className="text-sm text-muted-foreground">{circle.kind} · {circle.members} members</p><code className="invite-link">{inviteLink(circle.id)}</code></div></div>}{circle&&<InviteButtons id={circle.id} name={circle.name}/>}<Button asChild variant="ghost" className="start-circle-link"><Link to="/start-circle"><Plus size={15}/> Start a circle</Link></Button></div>;
}

export function MyCircles(){
 const state=usePassalong();
 return <section className="my-circles"><div className="section-label"><h2><Users size={17}/> My circles</h2><Button asChild variant="ghost"><Link to="/start-circle">Start a circle <Plus size={15}/></Link></Button></div>{state.myCircles.length===0?<p className="matching-muted">You're not in any circles yet. Start one and share the link.</p>:state.myCircles.map(c=><div key={c.id} className="person-row my-circle-row"><span className="flow-icon circle-icon"><Users size={20}/></span><div className="flex-1"><strong>{c.name}</strong><p className="text-sm text-muted-foreground">{c.kind} · {c.members} members</p></div><div className="my-circle-actions"><Button variant="outline" size="sm" onClick={()=>state.notify(`Invite link for ${c.name} copied — demo only, nothing sent.`)}><Copy size={13}/> Copy invite link</Button><Button variant="ghost" size="sm" aria-label={`Leave ${c.name}`} onClick={()=>{state.leaveCircle(c.id);state.notify(`You left ${c.name}.`);}}><LogOut size={13}/> Leave</Button></div></div>)}</section>;
}

export function StartCircle(){
 const state=usePassalong();const navigate=useNavigate();const [name,setName]=useState('');const [kind,setKind]=useState('Friend group');const [created,setCreated]=useState<{id:string;name:string;kind:string}|null>(null);
 function create(){const id=name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')||'new-circle';const c={id,name:name.trim(),kind};state.addMyCircle({...c,members:0});setCreated(c);}
 if(created)return <div className="flow-page start-circle-page"><span className="flow-icon circle-icon"><Check size={26}/></span><span className="eyebrow">YOUR CIRCLE IS READY</span><h1>{created.name}</h1><p className="flow-description">{created.kind} · 0 members, share the link to start</p><div className="invite-card invite-card-solo"><code className="invite-link">{inviteLink(created.id)}</code></div><InviteButtons id={created.id} name={created.name}/><p className="no-contacts"><Link2 size={14}/> No contacts uploaded. People join by link.</p><Button className="flow-next" onClick={()=>{state.notify(`Welcome to ${created.name}!`);navigate({to:'/profile'});}}>Done <ArrowRight/></Button></div>;
 return <div className="flow-page start-circle-page"><div className="flow-top"><Button variant="ghost" size="icon" aria-label="Go back" onClick={()=>navigate({to:'/profile'})}><ArrowLeft/></Button><span>START A CIRCLE</span><span/></div><span className="flow-icon circle-icon"><Users size={26}/></span><span className="eyebrow">YOUR PEOPLE, YOUR RULES</span><h1>Start a circle.</h1><p className="flow-description">A circle is any group you already trust. People join by invite link — no contacts uploaded.</p><label className="form-label">Circle name<input className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Thursday run club" maxLength={40}/></label><div className="form-label">What kind of group is it?<div className="circle-type-grid">{circleTypes.map(t=>{const Icon=typeIcons[t] ?? Users;return <Button key={t} variant="outline" className={`interest-option ${kind===t?'option-selected':''}`} onClick={()=>setKind(t)}><span><Icon size={22}/></span><strong>{t}</strong>{kind===t&&<Check size={15}/>}</Button>})}</div></div><Button className="flow-next" disabled={!name.trim()} onClick={create}>Create circle <ArrowRight/></Button></div>;
}
