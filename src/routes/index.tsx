import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Auth } from '@/components/live/auth';
import { useSession } from '@/components/live/session';
import { liveHead, safeNext } from '@/lib/passalong/live-rules';
export const Route=createFileRoute('/')({head:()=>liveHead('Passalong — Haas FTMBA 2027','Give useful items a new home in your Haas FTMBA 2027 circle. Sign in, post, claim and arrange a pickup.'),component:Index});
function Index(){const {user,loading}=useSession(),navigate=useNavigate();useEffect(()=>{if(user){const next=sessionStorage.getItem('passalong-next');sessionStorage.removeItem('passalong-next');void navigate({to:next?safeNext(next):'/home',replace:true});}},[user,navigate]);return loading||user?<main className="app-main">Opening your circle…</main>:<Auth next="/home"/>;}
