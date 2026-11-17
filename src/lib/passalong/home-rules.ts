export const ENDING_SOON_DAYS=2;
export const FOUND_HOME_LIMIT=6;
export const GIVER_REPLY_HOURS=24;
export function greeting(name:string,now=new Date()){
 const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',hourCycle:'h23'}).format(now));
 return `Good ${hour<12?'morning':hour<18?'afternoon':'evening'}, ${name.trim().split(/\s+/)[0]||'neighbor'}`;
}
export function postedAgo(value:string,now=new Date()){
 const hours=Math.max(0,Math.floor((now.getTime()-Date.parse(value))/3600000));
 return hours<1?'Posted just now':hours<24?`Posted ${hours}h ago`:`Posted ${Math.floor(hours/24)}d ago`;
}
export function endingSoon(item:{status:string;expires_at:string},now=new Date()){const end=Date.parse(item.expires_at);return item.status==='available'&&end>now.getTime()&&end<=now.getTime()+ENDING_SOON_DAYS*86400000;}
export function moreLike<T extends {id:string;category:string;custom_category?:string;circle_ids:string[];status:string;expires_at:string}>(item:T,items:T[],now=new Date()){
 return items.filter(i=>i.id!==item.id&&i.category===item.category&&(i.category!=='other'||i.custom_category?.trim().toLowerCase()===item.custom_category?.trim().toLowerCase())&&i.circle_ids.some(id=>item.circle_ids.includes(id))&&i.status==='available'&&Date.parse(i.expires_at)>now.getTime());
}